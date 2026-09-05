#!/usr/bin/env python3
"""Generate deterministic native-4K material masters and optimized web assets."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SIZE = 4096
MASTER_ROOT = ROOT / "assets" / "originals"
PUBLIC_ROOT = ROOT / "public" / "assets"


def save_pair(image: Image.Image, site: str, name: str) -> None:
    master_dir = MASTER_ROOT / site
    public_dir = PUBLIC_ROOT / site
    master_dir.mkdir(parents=True, exist_ok=True)
    public_dir.mkdir(parents=True, exist_ok=True)
    image.save(master_dir / f"{name}.png", optimize=True)
    image.save(public_dir / f"{name}.webp", "WEBP", quality=88, method=6)


def linear_gradient(top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    gradient = Image.new("RGB", (1, SIZE))
    pixels = gradient.load()
    for y in range(SIZE):
        t = y / (SIZE - 1)
        pixels[0, y] = tuple(round(a + (b - a) * t) for a, b in zip(top, bottom))
    return gradient.resize((SIZE, SIZE))


def titanium() -> Image.Image:
    base = linear_gradient((42, 46, 46), (7, 9, 9))
    noise = Image.effect_noise((SIZE, SIZE), 24).filter(ImageFilter.GaussianBlur(1.8))
    noise = ImageEnhance.Contrast(noise).enhance(0.55).convert("RGB")
    image = ImageChops.soft_light(base, noise)
    draw = ImageDraw.Draw(image, "RGBA")
    for x in range(-SIZE, SIZE * 2, 34):
        draw.line((x, 0, x - 860, SIZE), fill=(232, 220, 196, 18), width=3)
    for radius, alpha in ((1450, 18), (960, 22), (520, 26)):
        box = (SIZE * 0.62 - radius, SIZE * 0.35 - radius, SIZE * 0.62 + radius, SIZE * 0.35 + radius)
        draw.ellipse(box, outline=(187, 135, 74, alpha), width=22)
    return image


def quartz() -> Image.Image:
    base = linear_gradient((21, 23, 22), (2, 4, 4))
    draw = ImageDraw.Draw(base, "RGBA")
    rng = random.Random(92013)
    for branch in range(48):
        x = rng.randint(-300, SIZE + 300)
        y = rng.randint(-300, SIZE + 300)
        points = [(x, y)]
        angle = rng.uniform(-1.2, 1.2)
        for _ in range(rng.randint(4, 9)):
            angle += rng.uniform(-0.65, 0.65)
            distance = rng.randint(180, 620)
            x += math.cos(angle) * distance
            y += math.sin(angle) * distance
            points.append((x, y))
        draw.line(points, fill=(226, 236, 225, rng.randint(28, 74)), width=rng.randint(2, 7), joint="curve")
        if branch % 5 == 0:
            draw.line(points, fill=(142, 102, 57, 35), width=26, joint="curve")
    glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow, "RGBA")
    glow_draw.ellipse((720, 920, 3560, 3320), fill=(120, 132, 118, 30))
    glow = glow.filter(ImageFilter.GaussianBlur(260))
    return Image.alpha_composite(base.convert("RGBA"), glow).convert("RGB")


def linen() -> Image.Image:
    base = linear_gradient((231, 224, 207), (172, 158, 135))
    draw = ImageDraw.Draw(base, "RGBA")
    for p in range(0, SIZE, 13):
        draw.line((p, 0, p + 40, SIZE), fill=(77, 67, 50, 18), width=2)
        draw.line((0, p, SIZE, p - 26), fill=(255, 255, 244, 24), width=2)
    rng = random.Random(2037)
    for _ in range(720):
        x, y = rng.randrange(SIZE), rng.randrange(SIZE)
        length = rng.randint(12, 88)
        draw.line((x, y, x + length, y + rng.randint(-4, 4)), fill=(74, 61, 44, 22), width=1)
    return base


def fossil_surface() -> Image.Image:
    base = linear_gradient((4, 15, 17), (0, 3, 5))
    noise = Image.effect_noise((SIZE, SIZE), 52).filter(ImageFilter.GaussianBlur(2.2))
    noise = ImageEnhance.Contrast(noise).enhance(0.62).convert("RGB")
    image = ImageChops.soft_light(base, noise)
    draw = ImageDraw.Draw(image, "RGBA")
    rng = random.Random(0x7FEAD5C2)
    for _ in range(90):
        x, y = rng.randint(0, SIZE), rng.randint(0, SIZE)
        points = [(x, y)]
        angle = rng.uniform(0, math.tau)
        for _ in range(rng.randint(3, 8)):
            angle += rng.uniform(-0.7, 0.7)
            step = rng.randint(80, 360)
            x += math.cos(angle) * step
            y += math.sin(angle) * step
            points.append((x, y))
        color = (120, 255, 225, rng.randint(22, 66)) if rng.random() > 0.22 else (223, 239, 74, 58)
        draw.line(points, fill=color, width=rng.randint(2, 10), joint="curve")
    for _ in range(190):
        x, y = rng.randint(0, SIZE), rng.randint(0, SIZE)
        radius = rng.randint(8, 42)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), outline=(214, 208, 189, 36), width=2)
    return image


def main() -> None:
    save_pair(titanium(), "site-01", "material-titanium")
    save_pair(quartz(), "site-01", "material-quartz")
    save_pair(linen(), "site-01", "material-linen")
    save_pair(fossil_surface(), "site-04", "fossil-surface")
    print("Generated native 4096x4096 masters and optimized WebP derivatives.")


if __name__ == "__main__":
    main()
