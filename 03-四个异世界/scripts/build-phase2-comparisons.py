from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BEFORE = ROOT / "work" / "phase2" / "before-exact" / "desktop-1920"
AFTER = ROOT / "work" / "phase2" / "after-exact" / "desktop-1920"
OUTPUT = ROOT / "outputs"
SITES = {
    "site-01": "VANTA/FORM",
    "site-02": "GRAMMAR WEATHER",
    "site-03": "TEAR/LINE",
    "site-04": "THE PALE BELOW",
}


def font(path: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default()


title_font = font("C:/Windows/Fonts/arialbd.ttf", 28)
label_font = font("C:/Windows/Fonts/arialbd.ttf", 18)
meta_font = font("C:/Windows/Fonts/arial.ttf", 14)

OUTPUT.mkdir(parents=True, exist_ok=True)

for slug, title in SITES.items():
    before = Image.open(BEFORE / f"{slug}.png").convert("RGB")
    after = Image.open(AFTER / f"{slug}.png").convert("RGB")
    before.thumbnail((920, 518), Image.Resampling.LANCZOS)
    after.thumbnail((920, 518), Image.Resampling.LANCZOS)

    board = Image.new("RGB", (1920, 640), "#0d0d0c")
    draw = ImageDraw.Draw(board)
    draw.text((36, 24), title, fill="#f1eee5", font=title_font)
    draw.text((36, 66), "BEFORE / PHASE 1", fill="#8f8b82", font=label_font)
    draw.text((996, 66), "AFTER / PHASE 2", fill="#ef5a3c", font=label_font)
    draw.line((996, 95, 1884, 95), fill="#ef5a3c", width=3)
    draw.text(
        (36, 602),
        "Exact 1920 × 1080 production renders · same route · same steady-state capture",
        fill="#8f8b82",
        font=meta_font,
    )

    board.paste(before, (36, 96))
    board.paste(after, (996, 96))
    board.save(OUTPUT / f"phase2-comparison-{slug}.png", optimize=True)
