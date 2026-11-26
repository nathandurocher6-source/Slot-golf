"""Prepare the approved practice PNGs for PixiJS with Pillow and NumPy."""

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

from prepare_golf_assets import foreground_samples, grow


APP = Path(__file__).resolve().parents[1]
SOURCE = APP.parents[2] / 'artwork/practice'
OUTPUT = APP / 'static/assets/birdie-breakout/practice'

BACKGROUNDS = ('background_day', 'background_freespins')
# Pixel seeds mark unbroken artwork in the approved masters. The outer mask is
# taken from alpha; no color key is applied to the actual illustration.
FOREGROUNDS = {
    'practice_platform': ((1024, 340), (2048, 500)),
    'ball_dispenser': ((500, 950), (720, 960)),
    'tee_socket': ((750, 378), (192, 160)),
    'retractable_tee': ((625, 210), (96, 132)),
    'golf_ball': ((623, 647), (256, 256)),
    'golfer_address': ((325, 455), (850, 1190)),
}

# White/black and saturated plate colors can leak into partially transparent
# edges during export. Test for compositing spill against nearby intact ink.
MATTES = np.array(((255, 255, 255), (0, 0, 0), (255, 0, 0),
                   (0, 0, 255), (255, 255, 0)), dtype=np.float32)


def read_png(path):
    with Image.open(path) as source:
        return ImageOps.exif_transpose(source).convert('RGBA')


def clean_alpha(pixels, seed):
    alpha = pixels[:, :, 3]
    connected = Image.fromarray(grow(alpha >= 24, 1).astype(np.uint8) * 255).copy()
    if connected.getpixel(seed) != 255:
        raise ValueError(f'Foreground seed {seed} missed the artwork')
    ImageDraw.floodfill(connected, seed, 128)
    # Keep a narrow band for fine antialiased lines and remove isolated specks.
    keep = grow(np.asarray(connected) == 128, 2)
    pixels[~keep | (alpha <= 2)] = 0
    alpha[alpha >= 250] = 255


def clean_spill(pixels):
    rgb, alpha = pixels[:, :, :3], pixels[:, :, 3]
    solid = alpha >= 235
    y, x = np.nonzero((alpha > 2) & (alpha < 224) & grow(solid, 4))
    ink, found = foreground_samples(rgb, solid, y, x)
    color = rgb[y, x].astype(np.float32)
    coverage = alpha[y, x, None].astype(np.float32) / 255
    ink_error = np.linalg.norm(color - ink, axis=1)
    spill_error = np.full(len(x), np.inf)
    for matte in MATTES:
        estimate = ink * coverage + matte * (1 - coverage)
        spill_error = np.minimum(spill_error, np.linalg.norm(color - estimate, axis=1))
    replace = found & (ink_error > 20) & (spill_error < ink_error * 0.55)
    rgb[y[replace], x[replace]] = ink[replace]


def prepare_foreground(image, seed, limit):
    pixels = np.array(image)
    clean_alpha(pixels, seed)
    clean_spill(pixels)
    image = Image.fromarray(pixels)
    bbox = image.getbbox(alpha_only=True)
    if bbox is None:
        raise ValueError('Foreground cleanup left no visible artwork')
    image = image.crop(bbox)
    # Pillow resamples RGBA via premultiplied alpha for this filter.
    image.thumbnail(limit, Image.Resampling.LANCZOS)
    pixels = np.array(image)
    pixels[pixels[:, :, 3] <= 2] = 0
    return Image.fromarray(pixels), bbox


def save_contact_shadow(output):
    # One small shared sprite for the deck, shoes and dispenser. Its RGB is
    # uniform even in partially covered pixels, so resizing adds no matte fringe.
    alpha = Image.new('L', (128, 32))
    ImageDraw.Draw(alpha).ellipse((11, 9, 116, 22), fill=206)
    shadow = Image.new('RGBA', alpha.size, (24, 19, 13, 0))
    shadow.putalpha(alpha.filter(ImageFilter.GaussianBlur(4)))
    shadow.save(output / 'contact_shadow.png', optimize=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=SOURCE)
    parser.add_argument('--output', type=Path, default=OUTPUT)
    args = parser.parse_args()
    if args.source.resolve() == args.output.resolve():
        parser.error('Use a separate output directory to preserve the master PNGs')
    args.output.mkdir(parents=True, exist_ok=True)

    backdrop_size = None
    for name in BACKGROUNDS:
        image = read_png(args.source / f'{name}.png')
        if image.getchannel('A').getextrema() != (255, 255):
            raise ValueError(f'{name}: expected an opaque backdrop')
        if abs(image.width - image.height * 16 / 9) > 1:
            raise ValueError(f'{name}: expected the native 16:9 composition')
        if backdrop_size is not None and image.size != backdrop_size:
            raise ValueError('Day and sunset backdrops must share the same pixel dimensions')
        backdrop_size = image.size
        image.convert('RGB').save(args.output / f'{name}.png', optimize=True)
        print(f'{name}: {image.width}x{image.height} opaque')

    for name, (seed, limit) in FOREGROUNDS.items():
        image, bbox = prepare_foreground(read_png(args.source / f'{name}.png'), seed, limit)
        image.save(args.output / f'{name}.png', optimize=True)
        print(f'{name}: {image.width}x{image.height}, source crop {bbox}')
    save_contact_shadow(args.output)


if __name__ == '__main__':
    main()
