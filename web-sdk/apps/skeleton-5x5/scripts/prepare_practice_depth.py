"""Bake small lighting passes from the prepared practice and reel-frame PNGs."""

from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter


ASSETS = Path(__file__).resolve().parents[1] / 'static/assets/birdie-breakout'
PRACTICE = ASSETS / 'practice'


def plot_pass(base, color, coverage):
    layer = Image.new('RGBA', base.size, color)
    layer.putalpha(Image.fromarray(np.round(np.clip(coverage, 0, 1) * 255).astype(np.uint8)))
    return Image.alpha_composite(base, layer)


def normalized_axes(image):
    return np.linspace(0, 1, image.width)[None, :], np.linspace(0, 1, image.height)[:, None]


def save_ground_shadows(platform):
    # Share a compact contact texture across the two shoes, machine and dispenser.
    shape = Image.new('L', (128, 40))
    ImageDraw.Draw(shape).ellipse((11, 10, 116, 29), fill=158)
    core = Image.new('L', shape.size)
    ImageDraw.Draw(core).ellipse((19, 16, 108, 24), fill=123)
    contact = Image.new('RGBA', shape.size, (255, 255, 255))
    contact.putalpha(ImageChops.screen(shape.filter(ImageFilter.GaussianBlur(4)),
                                     core.filter(ImageFilter.GaussianBlur(2))))
    contact.save(PRACTICE / 'depth_contact_shadow.png', optimize=True)

    # Project the actual front edge of the deck. A broad penumbra and a tighter
    # seam make the curved lip look seated on the terrace.
    pad = (16, 12)
    size = (platform.width + 2 * pad[0], platform.height + 2 * pad[1])
    shade = Image.new('L', size)
    seam = Image.new('L', size)
    edge = np.asarray(platform.getchannel('A')) > 100
    contour = [(x + pad[0], np.flatnonzero(col)[-1] + pad[1])
               for x, col in enumerate(edge.T) if col.any()]
    ImageDraw.Draw(shade).line([(x + 3, y + 3) for x, y in contour], fill=156, width=9)
    ImageDraw.Draw(seam).line(contour, fill=170, width=3)
    shadow = Image.new('RGBA', size, (255, 255, 255))
    shadow.putalpha(ImageChops.screen(shade.filter(ImageFilter.GaussianBlur(4.5)),
                                    seam.filter(ImageFilter.GaussianBlur(1.3))))
    shadow.save(PRACTICE / 'platform_cast_shadow.png', optimize=True)


def save_platform_light(platform):
    x, y = normalized_axes(platform)
    coverage = np.asarray(platform.getchannel('A'), dtype=np.float32) / 255
    top_light = 0.14 * np.exp(-((y - 0.24) / 0.31) ** 2) * (1 - x * 0.71)
    lip_shade = np.clip((y - 0.59) / 0.34, 0, 1) * (0.18 + 0.12 * x)
    rear_shade = 0.13 * np.exp(-((y - 0.085) / 0.07) ** 2)
    light = Image.new('RGBA', platform.size)
    light = plot_pass(light, (249, 226, 153), coverage * top_light)
    light = plot_pass(light, (64, 39, 19), coverage * lip_shade)
    light = plot_pass(light, (40, 59, 25), coverage * rear_shade)
    light.save(PRACTICE / 'platform_light.png', optimize=True)


def save_portrait_platform(platform):
    # Open the turf surface toward the camera in portrait. Keep the front
    # fascia in its own band so the gold edge retains the original profile.
    width, height = 768, 288
    sections = ((0, 20, 23), (20, 96, 245), (96, 155, 20))
    deck = Image.new('RGBA', (width, height))
    y = 0
    for start, end, rows in sections:
        section = platform.crop((0, start, platform.width, end))
        deck.paste(section.resize((width, rows), Image.Resampling.LANCZOS), (0, y))
        y += rows
    deck = deck.transform(
        deck.size, Image.Transform.QUAD, (-73, 0, 0, height, width, height, width + 73, 0),
        Image.Resampling.BICUBIC,
    )
    pixels = np.array(deck)
    light = np.linspace(0.86, 0.99, height)[:, None, None]
    pixels[:, :, :3] = np.round(pixels[:, :, :3] * light)
    Image.fromarray(pixels).save(PRACTICE / 'platform_portrait.png', optimize=True)


def save_reel_recess():
    with Image.open(ASSETS / 'course/board-frame.png') as master:
        frame = master.convert('RGBA').resize((512, 512), Image.Resampling.LANCZOS)
    x, y = normalized_axes(frame)
    # Inner opening measured on the illustration. Shadows sit below the symbols
    # and above the printed felt without touching the brass or clipping the tiles.
    left, right, top, bottom = 0.055, 0.945, 0.181, 0.907
    opening = (x >= left) & (x <= right) & (y >= top) & (y <= bottom)
    shade = (0.57 * np.exp(-np.maximum(0, y - top) / 0.025)
             + 0.47 * np.exp(-np.maximum(0, x - left) / 0.013)
             + 0.33 * np.exp(-np.maximum(0, right - x) / 0.014)
             + 0.32 * np.exp(-np.maximum(0, bottom - y) / 0.016))
    shade = opening * np.clip(shade, 0, 0.69)

    # Light skims the painted rails at the top-left. The original frame's alpha
    # keeps the pass inside its existing silhouette, including the corner brass.
    rails = (((x >= 0.032) & (x <= 0.054) & (y >= 0.175) & (y <= 0.882))
             | ((x >= 0.045) & (x <= 0.955) & (y >= 0.150) & (y <= 0.181)))
    pixels = np.asarray(frame, dtype=np.float32) / 255
    luminance = pixels[:, :, :3].mean(axis=-1)
    reflection = rails * pixels[:, :, 3] * luminance * (0.39 - 0.23 * x)
    reflection *= np.clip((y - 0.15) / 0.011, 0, 1)
    recess = Image.new('RGBA', frame.size)
    recess = plot_pass(recess, (6, 22, 16), shade)
    recess = plot_pass(recess, (248, 218, 156), reflection)
    recess.save(PRACTICE / 'reel_recess.png', optimize=True)


def save_ambient_birds():
    # Three provisional wing poses in one atlas, drawn at 4x for clean edges.
    atlas = Image.new('RGBA', (96, 20))
    for index, tip in enumerate((1, 7, 15)):
        pose = Image.new('RGBA', (128, 80))
        points = [(2, tip + 1), (7, tip + 1), (14, 9), (17, 9), (24, tip), (30, tip + 1),
                  (24, 8), (19, 11), (17, 15), (14, 13), (10, 11), (6, 8)]
        ImageDraw.Draw(pose).polygon([(x * 4, y * 4) for x, y in points], fill='white')
        atlas.paste(pose.resize((32, 20), Image.Resampling.LANCZOS), (index * 32, 0))
    atlas.save(PRACTICE / 'ambient_birds.png', optimize=True)


def main():
    with Image.open(PRACTICE / 'practice_platform.png') as master:
        platform = master.convert('RGBA').resize((640, 50), Image.Resampling.LANCZOS)
        save_portrait_platform(master.convert('RGBA'))
    save_ground_shadows(platform)
    save_platform_light(platform)
    save_reel_recess()
    save_ambient_birds()


if __name__ == '__main__':
    main()
