"""Prepare Birdie Breakout PNGs from approved PNG and WebP masters with Pillow and NumPy."""

import argparse
from pathlib import Path
from unicodedata import normalize

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

from render_spin_ball import render_spin_ball


APP = Path(__file__).resolve().parents[1]
SOURCE_NAMES = {
    'background': ('Parcours de golf peint sous ciel bleu', 'Paysage de golf animé sans barrière'),
    'background-bonus': ('Parcours de golf au crépuscule enchanté', 'background-night', 'free-spins-background'),
    'board-frame': ('Image ChatGPT 22 nov. 2026, 17_28_06-2', 'Cadre de machine à sous golfique'),
    'logo': ('download', 'Logo de golf Birdie Breakout'),
    'mascot': ('Image ChatGPT 22 nov. 2026, 17_28_10-4', 'Golfeur souriant avec sac rouge'),
    'h1-driver': ('Image ChatGPT 22 nov. 2026, 17_28_12-5', 'Driver de golf premium en mouvement'),
    'h2-cart': ('Image ChatGPT 22 nov. 2026, 17_28_15-6', 'Voiturette de golf bleue et sac rouge'),
    'h3-irons': ('download-1', 'Éclat doré des clubs de golf'),
    'h4-tees': ('Image ChatGPT 22 nov. 2026, 17_28_19-8', 'Deux tees de golf dans l’herbe'),
    'wild': ('Image ChatGPT 22 nov. 2026, 17_28_20-9', 'Trophée de golf doré WILD'),
    'scatter': ('Image ChatGPT 22 nov. 2026, 17_28_21-10', 'Drapeau rouge sur trou de golf'),
    'l1-a': ('Birdie_Breakout_A',),
    'l2-k': ('Birdie_Breakout_K',),
    'l3-q': ('Birdie_Breakout_Q',),
    'l4-j': ('Birdie_Breakout_J',),
    'l5-10': ('Birdie_Breakout_10',),
}
SYMBOLS = {'h1-driver', 'h2-cart', 'h3-irons', 'h4-tees', 'wild', 'scatter', 'multiplier',
           'l1-a', 'l2-k', 'l3-q', 'l4-j', 'l5-10'}
RANKS = {'l1-a', 'l2-k', 'l3-q', 'l4-j', 'l5-10'}
BACKDROPS = {'background', 'background-bonus'}


# Coordinates in the source image, marking paper inside closed contours. The ball,
# clothing and bodywork are left intact, even where their colors match the paper.
MATTE_HOLES = {
    'mascot': ((0.225, 0.365), (0.516, 0.36), (0.35, 0.62), (0.793, 0.68)),
    'h2-cart': ((0.34, 0.29), (0.53, 0.31), (0.65, 0.28)),
    'decor-cart': ((0.42, 0.306), (0.552, 0.345), (0.63, 0.308)),
    'l1-a': ((0.46, 0.49), (0.50, 0.49)),
    'l3-q': ((0.50, 0.43), (0.50, 0.47)),
    'l5-10': ((0.652, 0.46), (0.443, 0.64)),
    'wild': ((0.185, 0.385), (0.815, 0.38), (0.75, 0.38), (0.34, 0.805), (0.65, 0.805)),
}

UI_ASSETS = (
    ('characters', 'decor-cart', '01_golf_cart_side.png'),
    ('ui', 'win', '04_win.png'),
    ('ui', 'big-win', '05_big_win.png'),
    ('ui', 'mega-win', '06_mega_win.png'),
    ('ui', 'bottom-bar', '09_bottom_bar_empty.png'),
)


def normalize_stem(name):
    return normalize('NFC', name).casefold()


def list_sources(directory):
    if not directory.is_dir():
        return {}
    sources = {}
    for path in sorted(directory.iterdir()):
        if path.is_file() and path.suffix.casefold() in ('.png', '.webp'):
            sources[(normalize_stem(path.stem), path.suffix.casefold())] = path
    return sources


def flood_regions(candidate, seeds=(), exterior=False):
    mask = Image.fromarray(candidate.astype(np.uint8) * 255)
    mask = ImageOps.expand(mask, border=1, fill=255 if exterior else 0)
    if exterior:
        ImageDraw.floodfill(mask, (0, 0), 128)
    for x, y in seeds:
        point = (round(x * candidate.shape[1]) + 1, round(y * candidate.shape[0]) + 1)
        if mask.getpixel(point) == 255:
            ImageDraw.floodfill(mask, point, 128)
    return np.asarray(mask)[1:-1, 1:-1] == 128


def grow(mask, radius):
    pixels = Image.fromarray(mask.astype(np.uint8) * 255)
    return np.asarray(pixels.filter(ImageFilter.MaxFilter(radius * 2 + 1))) != 0


# Look on both sides of the contour for the closest clean foreground sample.
# This runs on edge pixels during preparation. Interior pixels are never recolored.
EDGE_OFFSETS = sorted(
    ((dy, dx) for dy in range(-5, 6) for dx in range(-5, 6) if 0 < dx * dx + dy * dy <= 25),
    key=lambda offset: offset[0] ** 2 + offset[1] ** 2,
)


def foreground_samples(rgb, known_foreground, y, x):
    samples = rgb[y, x].astype(np.float32)
    missing = np.ones(len(x), dtype=bool)
    h, w = known_foreground.shape
    for dy, dx in EDGE_OFFSETS:
        indices = np.flatnonzero(missing)
        if indices.size == 0:
            break
        yy = np.clip(y[indices] + dy, 0, h - 1)
        xx = np.clip(x[indices] + dx, 0, w - 1)
        found = known_foreground[yy, xx]
        samples[indices[found]] = rgb[yy[found], xx[found]]
        missing[indices[found]] = False
    return samples, ~missing


def recover_paper_edge(pixels, matte, name):
    rgb = pixels[:, :, :3]
    edge = grow(matte, 3) & ~matte & (pixels[:, :, 3] == 255)
    contour = edge.copy()
    if name == 'h1-driver':
        # The colored speed streaks were painted over white. Recover their soft
        # falloff separately from the solid club, including its metal highlights.
        club = grow(rgb.min(axis=2) < 146, 8)
        club = ~flood_regions(~club, exterior=True)
        outline = Image.fromarray(club.astype(np.uint8) * 255)
        protected = np.asarray(outline.filter(ImageFilter.GaussianBlur(7))) / 255
        trail_weight = np.where(rgb.min(axis=2) > 144, 1 - protected, 0)
        edge |= (trail_weight > 0.02) & ~matte

    y, x = np.nonzero(edge)
    observed = rgb[y, x].astype(np.float32)
    reference, found = foreground_samples(rgb, ~edge & ~matte & (pixels[:, :, 3] == 255), y, x)
    paper_difference = 255 - observed
    ink_difference = 255 - reference
    energy = np.sum(ink_difference ** 2, axis=1)
    coverage = np.sum(paper_difference * ink_difference, axis=1) / np.maximum(energy, 1)
    fallback = paper_difference.max(axis=1) / 82
    coverage = np.where(found & (energy > 550), coverage, fallback)
    if name == 'h1-driver':
        core = np.where(contour[y, x], coverage, 1)
        weight = trail_weight[y, x]
        trail_coverage = np.clip(paper_difference.max(axis=1) / 122, 0, 1)
        coverage = core + weight * (trail_coverage - core)
    # A channel must remain representable after uncompositing the paper.
    minimum = paper_difference.max(axis=1) / 255
    coverage = np.clip(np.maximum(coverage, minimum), 1 / 255, 1)
    rgb[y, x] = np.rint(np.clip(255 - paper_difference / coverage[:, None], 0, 255))
    pixels[y, x, 3] = np.rint(coverage * 255)
    pixels[matte] = 0


def clean_native_edges(pixels):
    # Straight-alpha PNGs already have shape coverage. Only decontaminate colors
    # that are a better match for an edge composited over white than for clean ink.
    alpha = pixels[:, :, 3]
    solid = alpha >= 250
    y, x = np.nonzero((alpha > 0) & (alpha < 250) & grow(solid, 3))
    rgb = pixels[:, :, :3]
    match, found = foreground_samples(rgb, solid, y, x)
    recorded = rgb[y, x].astype(np.float32)
    amount = alpha[y, x, None].astype(np.float32) / 255
    over_white = match * amount + 255 * (1 - amount)
    straight_error = np.linalg.norm(recorded - match, axis=1)
    matte_error = np.linalg.norm(recorded - over_white, axis=1)
    remove = found & (straight_error > 10) & (matte_error < 0.6 * straight_error)
    # Match RGB to the neighboring solid ink as opacity tends to zero.
    recovered = (recorded - 255 * (1 - amount)) / amount
    weight = np.minimum(amount * 3, 1)
    corrected = recovered * weight + match * (1 - weight)
    rgb[y[remove], x[remove]] = np.rint(np.clip(corrected[remove], 0, 255))


def clean_sign(pixels, name):
    alpha = pixels[:, :, 3]
    face = flood_regions(alpha >= 128, ((0.5, 0.25 if name == 'bottom-bar' else 0.52),))
    if not np.any(face):
        return

    # Remove the thin horizontal export streaks attached to the outside rim.
    shape = grow(~grow(~face, 3), 3)
    outside = flood_regions(~shape, exterior=True)
    outline = Image.fromarray((~outside).astype(np.uint8) * 255)
    coverage = np.asarray(outline.filter(ImageFilter.GaussianBlur(0.72)))
    silhouette = grow(coverage > 2, 1)
    pixels[~silhouette] = 0
    if name == 'bottom-bar':
        return
    alpha[outside | (coverage < 255)] = np.minimum(alpha, coverage)[outside | (coverage < 255)]

    # The win masters have translucent scan lines across the printed turf.
    # Composite them over the neighboring turf color inside the gold rim.
    interior = ~grow(outside, 3)
    rgb = pixels[:, :, :3]
    turf = interior & (alpha == 255) & (rgb[:, :, 0] < 35) & (rgb[:, :, 1] > 40) & (rgb[:, :, 2] < 52)
    underlay = np.median(rgb[turf], axis=0) if np.any(turf) else (20, 55, 38)
    holes = interior & (alpha < 255)
    coverage = alpha[holes, None].astype(np.float32) / 255
    rgb[holes] = np.rint(rgb[holes] * coverage + underlay * (1 - coverage))
    alpha[holes] = 255


def cut_out(name, image):
    pixels = np.array(image)
    alpha = pixels[:, :, 3]
    has_alpha = np.any(alpha < 255)
    rgb = pixels[:, :, :3]
    darkest = rgb.min(axis=2)
    spread = np.ptp(rgb, axis=2)
    paper = (darkest >= 245) & (spread <= 12)
    if name == 'h3-irons' and image.size == (1024, 1024):
        # The shaft's bright center stripe reaches the open cap on download-1.png.
        cap = Image.new('1', image.size)
        ImageDraw.Draw(cap).polygon(
            ((803, 208), (812, 194), (829, 197), (854, 209), (866, 219),
             (841, 262), (800, 246)),
            fill=1,
        )
        paper &= ~np.asarray(cap)

    if name in RANKS:
        # The rank masters have neutral soft shadows baked onto the paper.
        paper |= (darkest >= 115) & (spread <= 16)
    elif name == 'mascot':
        rows = np.arange(image.height)[:, None] / image.height
        paper |= (rows > 0.905) & (darkest >= 156) & (spread <= 12)
        paper |= (rows > 0.948) & (darkest >= 112) & (spread <= 13)

    if has_alpha:
        clean_native_edges(pixels)
    holes = MATTE_HOLES.get(name, ())
    if not has_alpha or holes:
        matte = flood_regions(paper & (alpha != 0), holes, exterior=not has_alpha)
        recover_paper_edge(pixels, matte, name)
    if name in {'win', 'big-win', 'mega-win', 'bottom-bar'}:
        clean_sign(pixels, name)

    pixels[alpha <= 2] = 0
    return Image.fromarray(pixels)


def trim(image):
    bounds = image.getchannel('A').getbbox()
    if bounds is None:
        raise ValueError('No illustration remains after removing the matte')
    return image.crop(bounds)


def fit_symbol(image):
    # Preserve the original tile fill. Resample clean artwork once from the
    # master, with headroom for the largest tile at 1.5x renderer resolution.
    art = trim(image)
    size = 512
    art.thumbnail((480, 480), Image.Resampling.LANCZOS)
    tile = Image.new('RGBA', (size, size))
    tile.paste(art, ((size - art.width) // 2, (size - art.height) // 2))
    return tile


def save(image, output_dir, folder, name):
    path = output_dir / folder / f'{name}.png'
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, optimize=True)
    print(f'{folder}/{path.name}: {image.width} × {image.height}')


def read_rgba(path):
    with Image.open(path) as image:
        return ImageOps.exif_transpose(image).convert('RGBA')


def temporary_gold_ball(image):
    ball = trim(image)
    lightness = ImageOps.autocontrast(ball.convert('L'))
    gold = ImageOps.colorize(lightness, '#6b360e', '#fff1a3', '#e6a534', midpoint=170).convert('RGBA')
    alpha = ball.getchannel('A')
    gold.putalpha(alpha)
    gold.paste((0, 0, 0, 0), mask=alpha.point(lambda value: 255 if value == 0 else 0))
    return fit_symbol(gold)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, default=APP / 'artwork/golf')
    parser.add_argument('--output-dir', type=Path, default=APP / 'static/assets/birdie-breakout')
    parser.add_argument('--symbols-only', action='store_true', help='Refresh the active reel symbols only')
    args = parser.parse_args()
    if args.source_dir.resolve() == args.output_dir.resolve():
        parser.error('Source and output directories must differ')

    sources = list_sources(args.source_dir)
    ui_dir = args.source_dir / 'ui'

    def source_for(name, aliases=()):
        return next((sources[(normalize_stem(stem), extension)]
                     for stem in (name, *aliases) for extension in ('.png', '.webp')
                     if (normalize_stem(stem), extension) in sources), None)

    for name, aliases in SOURCE_NAMES.items():
        # The studio supplies the current Practice Panic! logo directly in static.
        if name == 'logo':
            continue
        if args.symbols_only and name not in SYMBOLS:
            continue
        source = source_for(name, aliases)
        if source is None:
            parser.error(f'Missing approved PNG or WebP for {name} in {args.source_dir}')
        image = read_rgba(source)
        if name in BACKDROPS:
            save(image.convert('RGB'), args.output_dir, 'course', name)
            continue
        image = cut_out(name, image)
        if name in SYMBOLS:
            save(fit_symbol(image), args.output_dir, 'symbols', name)
        elif name == 'board-frame':
            save(image, args.output_dir, 'course', name)
        else:
            save(trim(image), args.output_dir, 'ui' if name == 'logo' else 'characters', name)

    gold_source = source_for('multiplier')
    if gold_source:
        ball = fit_symbol(cut_out('multiplier', read_rgba(gold_source)))
    else:
        print('Missing multiplier.png master; color-grading the approved dimpled ball.')
        white_ball = cut_out('spin-ball', read_rgba(ui_dir / '02_spin_golf_ball_no_shadow.png'))
        ball = temporary_gold_ball(white_ball)
    save(ball, args.output_dir, 'symbols', 'multiplier')
    if args.symbols_only:
        return

    for folder, name, filename in UI_ASSETS:
        image = read_rgba(ui_dir / filename)
        if name == 'bottom-bar':
            # The master includes a separate loose strip below the actual panel.
            image = image.crop((0, 0, image.width, 430))
        save(trim(cut_out(name, image)), args.output_dir, folder, name)

    save(render_spin_ball(), args.output_dir, 'ui', 'spin-ball')


if __name__ == '__main__':
    main()
