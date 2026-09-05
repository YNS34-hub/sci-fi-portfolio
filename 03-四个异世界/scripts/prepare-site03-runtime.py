#!/usr/bin/env python3
"""Prepare native 4K portrait runtime assets without enlarging source photos."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageStat


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "originals" / "site-03"
OUTPUT_DIR = ROOT / "public" / "assets" / "site-03"
TARGET = (4096, 6144)
FILES = (
    "look-01-vermilion",
    "look-02-cobalt",
    "look-03-pleat",
    "look-04-sleeve",
)


def edge_color(image: Image.Image) -> tuple[int, int, int]:
    width, height = image.size
    strip = max(8, min(width, height) // 240)
    edges = (
        image.crop((0, 0, width, strip)),
        image.crop((0, height - strip, width, height)),
        image.crop((0, 0, strip, height)),
        image.crop((width - strip, 0, width, height)),
    )
    totals = [0.0, 0.0, 0.0]
    pixel_count = 0
    for edge in edges:
        stats = ImageStat.Stat(edge)
        count = edge.width * edge.height
        pixel_count += count
        for channel in range(3):
            totals[channel] += stats.mean[channel] * count
    return tuple(round(channel / pixel_count) for channel in totals)


def prepare(name: str) -> None:
    source_path = SOURCE_DIR / f"{name}.jpg"
    output_path = OUTPUT_DIR / f"{name}.webp"
    with Image.open(source_path) as source:
        source = source.convert("RGB")
        scale = min(1.0, TARGET[0] / source.width, TARGET[1] / source.height)
        if scale < 1.0:
            source = source.resize(
                (round(source.width * scale), round(source.height * scale)),
                Image.Resampling.LANCZOS,
            )

        canvas = Image.new("RGB", TARGET, edge_color(source))
        offset = ((TARGET[0] - source.width) // 2, (TARGET[1] - source.height) // 2)
        canvas.paste(source, offset)

        # Extend the source by mirroring native edge bands. No source pixels are
        # enlarged, and the 4096px output remains wider than the most extreme
        # tension-state render at the required 3840px viewport.
        if offset[0] > 0:
            left = source.crop((0, 0, offset[0], source.height)).transpose(
                Image.Transpose.FLIP_LEFT_RIGHT,
            )
            right_width = TARGET[0] - source.width - offset[0]
            right = source.crop((source.width - right_width, 0, source.width, source.height)).transpose(
                Image.Transpose.FLIP_LEFT_RIGHT,
            )
            canvas.paste(left, (0, offset[1]))
            canvas.paste(right, (offset[0] + source.width, offset[1]))

        if offset[1] > 0:
            top = canvas.crop((0, offset[1], TARGET[0], offset[1] * 2)).transpose(
                Image.Transpose.FLIP_TOP_BOTTOM,
            )
            bottom_height = TARGET[1] - source.height - offset[1]
            bottom = canvas.crop(
                (
                    0,
                    offset[1] + source.height - bottom_height,
                    TARGET[0],
                    offset[1] + source.height,
                ),
            ).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
            canvas.paste(top, (0, 0))
            canvas.paste(bottom, (0, offset[1] + source.height))

        canvas.save(output_path, "WEBP", quality=88, method=6)
        print(f"{source_path.name}: {source.width}x{source.height} -> {canvas.width}x{canvas.height}")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename in FILES:
        prepare(filename)


if __name__ == "__main__":
    main()
