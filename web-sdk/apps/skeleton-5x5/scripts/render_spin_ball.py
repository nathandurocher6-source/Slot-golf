"""Render an orthographic golf ball atlas with stationary lighting, entirely offline."""

import numpy as np
from PIL import Image


COLUMNS = 8
ROWS = 6
CELL = 176
DIMPLES = 336


def dimple_surface():
    # Sample dimples evenly across the sphere so they change size correctly at the rim.
    count = DIMPLES
    indices = np.arange(count)
    z = 1 - (2 * indices + 1) / count
    angle = np.pi * (3 - np.sqrt(5)) * indices
    radial = np.sqrt(1 - z ** 2)
    centers = np.column_stack((radial * np.cos(angle), radial * np.sin(angle), z)).astype(np.float32)

    longitude = np.linspace(-np.pi, np.pi, 768, endpoint=False)
    latitude = np.linspace(-np.pi / 2, np.pi / 2, 385)
    lon, lat = np.meshgrid(longitude, latitude)
    directions = np.stack((np.cos(lat) * np.cos(lon), np.cos(lat) * np.sin(lon), np.sin(lat)), axis=-1)
    directions = directions.reshape(-1, 3).astype(np.float32)

    result = []
    radius = 0.083
    depth = 0.016
    for points in np.array_split(directions, 74):
        nearest = centers[np.argmax(points @ centers.T, axis=1)]
        dot = np.clip(np.sum(points * nearest, axis=1), -1, 1)
        distance = np.arccos(dot)
        inside = np.clip(1 - (distance / radius) ** 2, 0, 1)
        slope = (4 * depth / radius ** 2) * distance * inside
        tangent = (dot[:, None] * points - nearest) / np.maximum(np.sin(distance[:, None]), 1e-5)
        normal = points - tangent * slope[:, None]
        normal /= np.linalg.norm(normal, axis=1, keepdims=True)
        result.append(np.column_stack((normal, inside ** 1.65)))
    return np.concatenate(result).reshape(len(latitude), len(longitude), 4)


def sample_surface(surface, points):
    h, w = surface.shape[:2]
    x = (np.arctan2(points[:, 1], points[:, 0]) / (2 * np.pi) + 0.5) * w
    y = (np.arcsin(np.clip(points[:, 2], -1, 1)) / np.pi + 0.5) * (h - 1)
    ux = np.floor(x)
    vy = np.floor(y)
    x0 = ux.astype(np.int32) % w
    y0 = vy.astype(np.int32)
    x1 = (x0 + 1) % w
    y1 = np.minimum(y0 + 1, h - 1)
    xf = (x - ux)[:, None]
    yf = (y - vy)[:, None]
    lower = surface[y0, x0] * (1 - xf) + surface[y0, x1] * xf
    upper = surface[y1, x0] * (1 - xf) + surface[y1, x1] * xf
    return lower * (1 - yf) + upper * yf


def unit(vector):
    return vector / np.linalg.norm(vector)


def render_spin_ball():
    surface = dimple_surface()
    # Two samples per axis, with a transparent gutter between cells.
    size = CELL * 2
    grid = (np.arange(size) + 0.5 - size / 2) / (size / 2 - 5)
    x, y = np.meshgrid(grid, -grid)
    squared = x ** 2 + y ** 2
    sphere = squared < 1
    points = np.column_stack((x[sphere], y[sphere], np.sqrt(1 - squared[sphere])))
    axis = unit(np.array([0.24, 0.92, 0.31]))
    cross = np.cross(np.eye(3), axis).T
    key = unit(np.array([-0.63, 0.73, 0.69]))
    fill = unit(np.array([0.48, -0.45, 0.91]))
    atlas = Image.new('RGBA', (COLUMNS * CELL, ROWS * CELL))

    for frame, angle in enumerate(np.linspace(0, 2 * np.pi, COLUMNS * ROWS, endpoint=False)):
        rotation = (np.eye(3) * np.cos(angle)
                    + np.outer(axis, axis) * (1 - np.cos(angle)) + cross * np.sin(angle))
        sample = sample_surface(surface, points @ rotation)
        normal = sample[:, :3] @ rotation.T
        # A broad key and cool fill stay fixed as the actual surface turns.
        diffuse = 0.725 + 0.22 * np.maximum(normal @ key, 0) + 0.097 * np.maximum(normal @ fill, 0)
        diffuse -= sample[:, 3] * 0.062
        warm = np.maximum(normal @ key, 0)
        rgb = np.column_stack((diffuse + 0.017 * warm, diffuse + 0.012, diffuse + 0.029 - 0.014 * warm))
        canvas = np.zeros((size, size, 4), dtype=np.uint8)
        canvas[sphere, :3] = np.rint(np.clip(rgb, 0, 1) * 255)
        canvas[sphere, 3] = 255
        frame_image = Image.fromarray(canvas).resize((CELL, CELL), Image.Resampling.LANCZOS)
        pixels = np.array(frame_image)
        pixels[pixels[:, :, 3] <= 2] = 0
        atlas.paste(Image.fromarray(pixels), (frame % COLUMNS * CELL, frame // COLUMNS * CELL))
    return atlas
