#!/usr/bin/env python3
"""Split six horizontal triptych PNGs into 18 production-ready WebP shots.

The command-line order is the story order: the three panels from source 1
become shot-01..03, source 2 becomes shot-04..06, and so on.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from statistics import median
from typing import Sequence

try:
    from PIL import Image, ImageOps, features
except ImportError as exc:  # pragma: no cover - only reached without dependency
    raise SystemExit(
        "ERROR: Pillow is required. Install it with: python -m pip install Pillow"
    ) from exc


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "public" / "assets" / "shots"
OUTPUT_SIZE = (1280, 720)
TARGET_ASPECT = OUTPUT_SIZE[0] / OUTPUT_SIZE[1]


class SliceError(RuntimeError):
    """An expected, user-actionable input or export error."""


@dataclass(frozen=True)
class DarkRun:
    start: int
    end: int  # exclusive
    peak_ratio: float
    median_ratio: float

    @property
    def width(self) -> int:
        return self.end - self.start

    @property
    def midpoint(self) -> float:
        return (self.start + self.end - 1) / 2


@dataclass(frozen=True)
class Separator:
    start: int
    end: int  # exclusive; start == end for an equal-third fallback
    method: str
    confidence: float


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Slice exactly six horizontal triptych PNGs into shot-01.webp through "
            "shot-18.webp. Input order determines shot order."
        ),
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "sources",
        nargs="+",
        type=Path,
        help="Six PNG files, in narrative order.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help="Directory for the 18 WebP files.",
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=None,
        help="JSON manifest path (defaults to OUTPUT_DIR/shots-manifest.json).",
    )
    parser.add_argument(
        "--quality",
        type=int,
        default=92,
        help="WebP lossy quality, from 1 to 100.",
    )
    parser.add_argument(
        "--dark-threshold",
        type=int,
        default=24,
        help="Grayscale value at or below which a pixel counts as black.",
    )
    parser.add_argument(
        "--dark-ratio",
        type=float,
        default=0.92,
        help="Minimum black-pixel fraction for an unambiguous separator column.",
    )
    return parser.parse_args(argv)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def display_path(path: Path) -> str:
    resolved = path.resolve()
    try:
        return resolved.relative_to(PROJECT_ROOT).as_posix()
    except ValueError:
        return str(resolved)


def validate_args(args: argparse.Namespace) -> tuple[list[Path], Path, Path]:
    if len(args.sources) != 6:
        raise SliceError(
            f"Expected exactly 6 triptych PNGs, but received {len(args.sources)}."
        )
    if not 1 <= args.quality <= 100:
        raise SliceError("--quality must be between 1 and 100.")
    if not 0 <= args.dark_threshold <= 80:
        raise SliceError("--dark-threshold must be between 0 and 80.")
    if not 0.5 <= args.dark_ratio <= 1.0:
        raise SliceError("--dark-ratio must be between 0.5 and 1.0.")
    if not features.check("webp"):
        raise SliceError(
            "This Pillow installation has no WebP encoder. Reinstall a Pillow build "
            "with WebP support."
        )

    sources = [source.expanduser().resolve() for source in args.sources]
    if len(set(sources)) != 6:
        raise SliceError("The six source paths must be unique.")
    for source in sources:
        if not source.exists():
            raise SliceError(f"Source file does not exist: {source}")
        if not source.is_file():
            raise SliceError(f"Source path is not a file: {source}")
        if source.suffix.lower() != ".png":
            raise SliceError(f"Source must use the .png extension: {source}")

    output_dir = args.output_dir.expanduser().resolve()
    manifest = (
        args.manifest.expanduser().resolve()
        if args.manifest is not None
        else output_dir / "shots-manifest.json"
    )
    if manifest.suffix.lower() != ".json":
        raise SliceError(f"Manifest must be a .json file: {manifest}")
    return sources, output_dir, manifest


def load_png(path: Path) -> Image.Image:
    try:
        with Image.open(path) as probe:
            if probe.format != "PNG":
                raise SliceError(
                    f"File has a .png extension but is actually {probe.format or 'unknown'}: "
                    f"{path}"
                )
            probe.verify()
        with Image.open(path) as source:
            source.load()
            image = ImageOps.exif_transpose(source).convert("RGB")
    except SliceError:
        raise
    except Exception as exc:
        raise SliceError(f"Cannot decode PNG {path}: {exc}") from exc

    width, height = image.size
    if width <= height:
        raise SliceError(
            f"Source is not horizontal ({width}x{height}): {path}"
        )
    if width < 384 or height < 128:
        raise SliceError(
            f"Source is too small for three usable panels ({width}x{height}): {path}"
        )
    return image


def column_dark_ratios(image: Image.Image, threshold: int) -> list[float]:
    """Measure black coverage per x column, ignoring likely top/bottom letterbox bars."""
    gray = ImageOps.grayscale(image)
    width, height = gray.size
    y0 = round(height * 0.12)
    y1 = max(y0 + 1, round(height * 0.88))
    sample_height = min(420, y1 - y0)
    sample = gray.crop((0, y0, width, y1)).resize(
        (width, sample_height), Image.Resampling.BOX
    )
    pixels = sample.load()
    return [
        sum(1 for y in range(sample_height) if pixels[x, y] <= threshold)
        / sample_height
        for x in range(width)
    ]


def contiguous_dark_runs(ratios: Sequence[float], minimum: float) -> list[DarkRun]:
    """Return separator candidates and bridge tiny antialiasing holes."""
    hard_runs: list[tuple[int, int]] = []
    run_start: int | None = None
    for index, ratio in enumerate(ratios):
        if ratio >= minimum:
            if run_start is None:
                run_start = index
        elif run_start is not None:
            hard_runs.append((run_start, index))
            run_start = None
    if run_start is not None:
        hard_runs.append((run_start, len(ratios)))

    merged: list[tuple[int, int]] = []
    for start, end in hard_runs:
        if merged and start - merged[-1][1] <= 2:
            merged[-1] = (merged[-1][0], end)
        else:
            merged.append((start, end))

    runs: list[DarkRun] = []
    shoulder_minimum = max(0.62, minimum - 0.14)
    for start, end in merged:
        while start > 0 and ratios[start - 1] >= shoulder_minimum:
            start -= 1
        while end < len(ratios) and ratios[end] >= shoulder_minimum:
            end += 1
        values = ratios[start:end]
        runs.append(
            DarkRun(
                start=start,
                end=end,
                peak_ratio=max(values),
                median_ratio=float(median(values)),
            )
        )
    return runs


def choose_separator(
    ratios: Sequence[float],
    runs: Sequence[DarkRun],
    expected: float,
    dark_ratio: float,
) -> Separator:
    width = len(ratios)
    radius = width * 0.135
    low = expected - radius
    high = expected + radius
    candidates = [run for run in runs if low <= run.midpoint <= high]

    if candidates:
        def candidate_score(run: DarkRun) -> float:
            proximity = 1.0 - abs(run.midpoint - expected) / radius
            useful_width = min(run.width / max(2.0, width * 0.008), 1.0)
            return (
                run.peak_ratio * 0.42
                + run.median_ratio * 0.28
                + proximity * 0.22
                + useful_width * 0.08
            )

        winner = max(candidates, key=candidate_score)
        confidence = candidate_score(winner)
        return Separator(
            start=winner.start,
            end=winner.end,
            method="detected-black-separator",
            confidence=round(min(confidence, 1.0), 4),
        )

    # A one-pixel rule can be softened by artwork crossing it. Accept a strong
    # local peak; otherwise an exact third is safer than guessing at dark content.
    search_start = max(1, round(low))
    search_end = min(width - 1, round(high))
    local_peak = max(range(search_start, search_end), key=ratios.__getitem__)
    peak_ratio = ratios[local_peak]
    soft_minimum = max(0.72, dark_ratio - 0.14)
    if peak_ratio >= soft_minimum:
        start = local_peak
        end = local_peak + 1
        while start > search_start and ratios[start - 1] >= soft_minimum:
            start -= 1
        while end < search_end and ratios[end] >= soft_minimum:
            end += 1
        return Separator(
            start=start,
            end=end,
            method="detected-narrow-black-rule",
            confidence=round(peak_ratio, 4),
        )

    fallback = round(expected)
    return Separator(
        start=fallback,
        end=fallback,
        method="equal-third-fallback",
        confidence=0.0,
    )


def detect_separators(
    image: Image.Image, threshold: int, dark_ratio: float
) -> tuple[Separator, Separator]:
    width, _ = image.size
    ratios = column_dark_ratios(image, threshold)
    runs = contiguous_dark_runs(ratios, dark_ratio)
    first = choose_separator(ratios, runs, width / 3, dark_ratio)
    second = choose_separator(ratios, runs, width * 2 / 3, dark_ratio)
    if first.end > second.start:
        # This should only happen with a very large central black region. Use its
        # centre as two equal-third boundaries instead of producing an empty panel.
        first = Separator(round(width / 3), round(width / 3), "equal-third-fallback", 0.0)
        second = Separator(
            round(width * 2 / 3),
            round(width * 2 / 3),
            "equal-third-fallback",
            0.0,
        )
    return first, second


def panel_boxes(
    image_size: tuple[int, int], separators: tuple[Separator, Separator]
) -> list[tuple[int, int, int, int]]:
    width, height = image_size
    first, second = separators
    # Move two pixels into the picture after a real gutter so antialiasing from
    # the black rule cannot survive the resize.
    safety = max(1, round(width * 0.0012))
    first_left_pad = safety if first.end > first.start else 0
    first_right_pad = safety if first.end > first.start else 0
    second_left_pad = safety if second.end > second.start else 0
    second_right_pad = safety if second.end > second.start else 0
    boxes = [
        (0, 0, first.start - first_left_pad, height),
        (first.end + first_right_pad, 0, second.start - second_left_pad, height),
        (second.end + second_right_pad, 0, width, height),
    ]
    minimum_width = max(64, round(width * 0.12))
    for panel_number, (left, top, right, bottom) in enumerate(boxes, start=1):
        if right - left < minimum_width or bottom - top < 64:
            raise SliceError(
                f"Detected panel {panel_number} is implausibly small: "
                f"{right - left}x{bottom - top}. Try adjusting --dark-threshold "
                "or --dark-ratio."
            )
    return boxes


def edge_black_fraction(
    gray: Image.Image, axis: str, index: int, threshold: int
) -> float:
    width, height = gray.size
    pixels = gray.load()
    if axis == "x":
        step = max(1, height // 360)
        values = range(0, height, step)
        return sum(pixels[index, y] <= threshold for y in values) / len(values)
    step = max(1, width // 360)
    values = range(0, width, step)
    return sum(pixels[x, index] <= threshold for x in values) / len(values)


def trim_black_border(
    panel: Image.Image, threshold: int
) -> tuple[Image.Image, tuple[int, int, int, int]]:
    """Trim only contiguous near-uniform black borders, capped to avoid scene loss."""
    gray = ImageOps.grayscale(panel)
    width, height = gray.size
    max_x = max(1, round(width * 0.045))
    max_y = max(1, round(height * 0.045))
    minimum_fraction = 0.965

    def scan(axis: str, reverse: bool, limit: int) -> int:
        axis_length = width if axis == "x" else height
        removed = 0
        for offset in range(limit):
            index = axis_length - 1 - offset if reverse else offset
            if edge_black_fraction(gray, axis, index, threshold + 6) < minimum_fraction:
                break
            removed += 1
        return removed

    left = scan("x", False, max_x)
    right = scan("x", True, max_x)
    top = scan("y", False, max_y)
    bottom = scan("y", True, max_y)

    # One extra pixel of picture-side inset prevents a dark antialiased fringe.
    left = min(width - 1, left + (1 if left else 0))
    right = min(width - left - 1, right + (1 if right else 0))
    top = min(height - 1, top + (1 if top else 0))
    bottom = min(height - top - 1, bottom + (1 if bottom else 0))
    crop_box = (left, top, width - right, height - bottom)
    if crop_box[2] - crop_box[0] < 64 or crop_box[3] - crop_box[1] < 64:
        raise SliceError("Black-border trimming left too little usable image content.")
    return panel.crop(crop_box), crop_box


def crop_to_aspect(image: Image.Image) -> tuple[Image.Image, tuple[int, int, int, int]]:
    width, height = image.size
    current_aspect = width / height
    if current_aspect > TARGET_ASPECT:
        crop_width = max(1, round(height * TARGET_ASPECT))
        left = round((width - crop_width) * 0.5)
        box = (left, 0, left + crop_width, height)
    else:
        crop_height = max(1, round(width / TARGET_ASPECT))
        # A slight upward bias protects faces while remaining visually centred.
        top = round((height - crop_height) * 0.46)
        box = (0, top, width, top + crop_height)
    return image.crop(box), box


def save_webp(image: Image.Image, destination: Path, quality: int) -> None:
    try:
        image.resize(OUTPUT_SIZE, Image.Resampling.LANCZOS).save(
            destination,
            format="WEBP",
            quality=quality,
            method=6,
            exact=True,
        )
    except Exception as exc:
        raise SliceError(f"Failed to encode WebP {destination.name}: {exc}") from exc


def absolute_crop_box(
    panel_box: tuple[int, int, int, int],
    trim_box: tuple[int, int, int, int],
    aspect_box: tuple[int, int, int, int],
) -> list[int]:
    return [
        panel_box[0] + trim_box[0] + aspect_box[0],
        panel_box[1] + trim_box[1] + aspect_box[1],
        panel_box[0] + trim_box[0] + aspect_box[2],
        panel_box[1] + trim_box[1] + aspect_box[3],
    ]


def build_assets(
    sources: Sequence[Path],
    output_dir: Path,
    manifest_path: Path,
    quality: int,
    dark_threshold: int,
    dark_ratio: float,
) -> dict[str, object]:
    output_dir.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    temp_root = Path(
        tempfile.mkdtemp(prefix=".cut-fever-shots-", dir=output_dir.parent)
    )
    temp_manifest = temp_root / "shots-manifest.json"

    source_records: list[dict[str, object]] = []
    shot_records: list[dict[str, object]] = []
    try:
        for source_index, source_path in enumerate(sources, start=1):
            image = load_png(source_path)
            separators = detect_separators(image, dark_threshold, dark_ratio)
            boxes = panel_boxes(image.size, separators)
            source_record: dict[str, object] = {
                "index": source_index,
                "file": display_path(source_path),
                "width": image.width,
                "height": image.height,
                "sha256": sha256_file(source_path),
                "separators": [
                    {
                        "start": separator.start,
                        "end": separator.end,
                        "method": separator.method,
                        "confidence": separator.confidence,
                    }
                    for separator in separators
                ],
            }
            source_records.append(source_record)

            methods = ", ".join(separator.method for separator in separators)
            print(
                f"[{source_index}/6] {source_path.name} "
                f"({image.width}x{image.height}) -> {methods}"
            )

            for panel_index, panel_box in enumerate(boxes, start=1):
                shot_number = (source_index - 1) * 3 + panel_index
                filename = f"shot-{shot_number:02d}.webp"
                panel = image.crop(panel_box)
                trimmed, trim_box = trim_black_border(panel, dark_threshold)
                framed, aspect_box = crop_to_aspect(trimmed)
                temp_path = temp_root / filename
                save_webp(framed, temp_path, quality)
                shot_records.append(
                    {
                        "id": f"shot-{shot_number:02d}",
                        "file": f"public/assets/shots/{filename}",
                        "sourceIndex": source_index,
                        "sourcePanel": panel_index,
                        "sourcePanelBox": list(panel_box),
                        "sourceCropBox": absolute_crop_box(
                            panel_box, trim_box, aspect_box
                        ),
                        "width": OUTPUT_SIZE[0],
                        "height": OUTPUT_SIZE[1],
                        "bytes": temp_path.stat().st_size,
                        "sha256": sha256_file(temp_path),
                    }
                )

        manifest: dict[str, object] = {
            "schemaVersion": 1,
            "generator": "scripts/slice_storyboards.py",
            "settings": {
                "outputWidth": OUTPUT_SIZE[0],
                "outputHeight": OUTPUT_SIZE[1],
                "format": "webp",
                "quality": quality,
                "darkThreshold": dark_threshold,
                "darkRatio": dark_ratio,
            },
            "sourceCount": len(source_records),
            "shotCount": len(shot_records),
            "sources": source_records,
            "shots": shot_records,
        }
        temp_manifest.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

        output_dir.mkdir(parents=True, exist_ok=True)
        for shot_number in range(1, 19):
            filename = f"shot-{shot_number:02d}.webp"
            os.replace(temp_root / filename, output_dir / filename)
        os.replace(temp_manifest, manifest_path)
        return manifest
    finally:
        shutil.rmtree(temp_root, ignore_errors=True)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    try:
        sources, output_dir, manifest_path = validate_args(args)
        manifest = build_assets(
            sources=sources,
            output_dir=output_dir,
            manifest_path=manifest_path,
            quality=args.quality,
            dark_threshold=args.dark_threshold,
            dark_ratio=args.dark_ratio,
        )
    except SliceError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    except OSError as exc:
        print(f"ERROR: File operation failed: {exc}", file=sys.stderr)
        return 2

    print(
        f"Done: {manifest['shotCount']} shots at {OUTPUT_SIZE[0]}x{OUTPUT_SIZE[1]}"
    )
    print(f"Assets: {output_dir}")
    print(f"Manifest: {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
