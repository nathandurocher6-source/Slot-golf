"""Prepare the golf artwork. Run with Python 3, Pillow and NumPy installed."""

import argparse
from pathlib import Path
from unicodedata import normalize

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps


APP = Path(__file__).resolve().parents[1]
SOURCE_NAMES = {
    'background': 'Paysage de golf animé sans barrière',
    'board-frame': 'Cadre de machine à sous golfique',
    'logo': 'Logo de golf Birdie Breakout',
    'mascot': 'Golfeur souriant avec sac rouge',
    'h1-driver': 'Driver de golf premium en mouvement',
    'h2-cart': 'Voiturette de golf bleue et sac rouge',
    'h3-irons': 'Éclat doré des clubs de golf',
    'h4-tees': 'Deux tees de golf dans l’herbe',
    'wild': 'Trophée de golf doré WILD',
    'scatter': 'Drapeau rouge sur trou de golf',
    'multiplier': 'multiplier',
    'l1-a': 'Lettre A golf et gazon scintillante',
    'l2-k': 'K doré, golf et éclats lumineux',
    'l3-q': 'Q doré, golf et gazon brillant',
    'l4-j': 'J doré scintillant, golf et gazon',
    'l5-10': '10 doré, golf et gazon scintillant',
}

# Seed enclosed areas of white matte while preserving the artwork's white details.
WHITE_HOLES = {
    'l1-a': [(0.50, 0.49)],
    'l3-q': [(0.50, 0.47)],
    'l5-10': [(0.67, 0.50)],
    'wild': [(0.21, 0.38), (0.75, 0.38)],
}


def remove_white_matte(image, holes):
    rgba = image.convert('RGBA')
    if rgba.getchannel('A').getextrema()[0] < 255:
        return rgba

    rgb = np.asarray(rgba)[..., :3]
    distance = 255 - rgb.min(axis=2)
    near_white = (distance <= 14) & (np.ptp(rgb, axis=2) <= 10)
    mask = ImageOps.expand(Image.fromarray(near_white.astype(np.uint8) * 255), border=1, fill=255)
    ImageDraw.floodfill(mask, (0, 0), 128)
    for x, y in holes:
        seed = (round(x * rgba.width) + 1, round(y * rgba.height) + 1)
        if mask.getpixel(seed) == 255:
            ImageDraw.floodfill(mask, seed, 128)

    matte = np.asarray(mask)[1:-1, 1:-1] == 128
    matte_image = Image.fromarray(matte.astype(np.uint8) * 255)
    fringe = (np.asarray(matte_image.filter(ImageFilter.MaxFilter(5))) > 0) & ~matte
    local_distance = np.asarray(Image.fromarray(distance).filter(ImageFilter.MaxFilter(7)))

    # Estimate edge coverage and subtract white spill before resampling in premultiplied alpha.
    coverage = (distance[fringe].astype(np.float32) - 4) / np.maximum(local_distance[fringe], 32)
    coverage = np.clip(coverage, 1 / 255, 1)
    pixels = np.array(rgba)
    unmatted = 255 + (rgb[fringe].astype(np.float32) - 255) / coverage[:, None]
    pixels[fringe, :3] = np.rint(np.clip(unmatted, 0, 255))
    pixels[fringe, 3] = np.rint(coverage * 255)
    pixels[matte] = 0
    return Image.fromarray(pixels)


def trim(image):
    bounds = image.getchannel('A').point(lambda alpha: 255 if alpha > 16 else 0).getbbox()
    if bounds is None:
        raise ValueError('No artwork remains after removing the white matte')
    return image.crop(bounds)


def fit_symbol(image):
    art = ImageOps.contain(trim(image), (480, 480), Image.Resampling.LANCZOS)
    tile = Image.new('RGBA', (512, 512))
    tile.paste(art, ((512 - art.width) // 2, (512 - art.height) // 2))
    return tile


def make_multiplier(scatter):
    # The supplied Scatter's golf ball provides temporary art until a multiplier source is supplied.
    crop = (628, 796, 832, 1000)
    bounds = tuple(round(value * size / 1254) for value, size in zip(crop, scatter.size * 2))
    ball = scatter.crop(bounds).convert('L').resize((480, 480), Image.Resampling.LANCZOS)
    gold = ImageOps.colorize(ball, '#1e0b03', '#fff5ab', '#d48a11', midpoint=155).convert('RGBA')
    mask = Image.new('L', (960, 960))
    ImageDraw.Draw(mask).ellipse((2, 2, 957, 957), fill=255)
    gold.putalpha(mask.resize(gold.size, Image.Resampling.LANCZOS))
    return fit_symbol(gold)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, default=APP / 'artwork/golf')
    parser.add_argument('--output-dir', type=Path, default=APP / 'static/assets/golf')
    args = parser.parse_args()

    sources = {
        (normalize('NFC', path.stem).casefold(), path.suffix.casefold()): path
        for path in args.source_dir.iterdir()
        if path.suffix.casefold() in ('.png', '.webp')
    }
    inputs = {}
    for name, original in SOURCE_NAMES.items():
        inputs[name] = next((
            sources[(stem, ext)]
            for stem in (name, original.casefold())
            for ext in ('.png', '.webp')
            if (stem, ext) in sources
        ), None)
        if inputs[name] is None and name != 'multiplier':
            parser.error(f'Missing PNG or WebP source for {name} in {args.source_dir}')

    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name, source in inputs.items():
        with Image.open(source or inputs['scatter']) as image:
            image = ImageOps.exif_transpose(image)
            if source is None:
                output = make_multiplier(image)
            elif name == 'background':
                output = image.convert('RGB')
                output.thumbnail((1600, 1080), Image.Resampling.LANCZOS)
            else:
                art = remove_white_matte(image, WHITE_HOLES.get(name, ()))
                if name == 'board-frame':
                    output = ImageOps.contain(art, (1024, 1024), Image.Resampling.LANCZOS)
                elif name == 'logo':
                    output = ImageOps.contain(trim(art), (768, 512), Image.Resampling.LANCZOS)
                elif name == 'mascot':
                    output = ImageOps.contain(trim(art), (512, 768), Image.Resampling.LANCZOS)
                else:
                    output = fit_symbol(art)

        target = args.output_dir / f'{name}.png'
        output.save(target, optimize=True)
        print(f'{target.name}: {output.width} × {output.height} ({source.name if source else "Scatter fallback"})')


if __name__ == '__main__':
    main()
