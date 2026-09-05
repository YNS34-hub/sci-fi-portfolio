import { buildFieldSignature, createMinuteLayers, sampleLayerDisplacement } from "../core/time-field.js";
import { formatDuration } from "../core/creation-ledger.js";

const WIDTH = 1800;
const HEIGHT = 2400;

function drawLetterspacedText(context, text, x, y, spacing) {
  let cursor = x;
  for (const character of text) {
    context.fillText(character, cursor, y);
    cursor += context.measureText(character).width + spacing;
  }
}

function makeImpulses(marks) {
  return marks.slice(-120).map((mark) => ({
    x: mark.x,
    y: mark.y,
    minuteIndex: Math.round(mark.y * 179),
    radius: 6 + mark.force * 16,
    energy: 0.2 + mark.force * 0.68,
  }));
}

export async function exportMoment({ memory, act, secondsSeen, creationDuration = 10_800 }) {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d", { alpha: false });
  const layers = createMinuteLayers("after-three-hours:poster", 180);
  const marks = Array.isArray(memory?.marks) ? memory.marks : [];
  const impulses = makeImpulses(marks);
  const signature = buildFieldSignature(marks);

  context.fillStyle = "#f6f7f2";
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const field = { left: 170, right: 1630, top: 480, bottom: 1900 };
  const fieldWidth = field.right - field.left;
  const fieldHeight = field.bottom - field.top;

  context.lineCap = "round";
  context.lineJoin = "round";
  for (const layer of layers) {
    const baseY = field.top + (layer.index / 179) * fieldHeight;
    const major = layer.minute === 1 || layer.minute === 180 || layer.minute % 30 === 0;
    context.beginPath();
    for (let segment = 0; segment <= 72; segment += 1) {
      const normalizedX = segment / 72;
      const x = field.left + normalizedX * fieldWidth;
      const displacement = sampleLayerDisplacement(layer, normalizedX, 92, impulses, act, false) * 2.8;
      const y = baseY + displacement;
      if (segment === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = major ? "rgba(49,93,112,.6)" : `rgba(24,32,34,${0.12 + layer.grain * 0.09})`;
    context.lineWidth = major ? 2.2 : 1.05 + layer.grain;
    context.stroke();
  }

  for (const [index, mark] of marks.slice(-160).entries()) {
    const x = field.left + mark.x * fieldWidth;
    const y = field.top + mark.y * fieldHeight;
    context.strokeStyle = `rgba(49,93,112,${0.22 + mark.force * 0.55})`;
    context.lineWidth = 1.2 + mark.force * 2.3;
    context.beginPath();
    context.moveTo(x, y - 5 - mark.force * 10);
    context.lineTo(x + Math.sin(index * 1.8) * 4, y + 6 + mark.force * 16);
    context.stroke();
  }

  const nowX = field.left + 0.64 * fieldWidth;
  context.strokeStyle = "#315d70";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(nowX, field.top - 28);
  context.lineTo(nowX, field.bottom + 28);
  context.stroke();

  context.fillStyle = "#182022";
  context.font = '600 142px "Bahnschrift SemiCondensed", "Arial Narrow", sans-serif';
  context.fillText("三小时之后", 165, 210);
  context.fillStyle = "#315d70";
  context.font = '560 64px "Bahnschrift SemiCondensed", "Arial Narrow", sans-serif';
  drawLetterspacedText(context, "AFTER THREE HOURS", 170, 300, 4);

  context.fillStyle = "#596663";
  context.font = '22px "Microsoft YaHei UI", sans-serif';
  context.fillText("180 根分钟纤维，和一个没有被白白交出的夜晚。", 172, 375);

  context.strokeStyle = "rgba(24,32,34,.28)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(165, 2060);
  context.lineTo(1635, 2060);
  context.stroke();

  context.fillStyle = "#182022";
  context.font = '26px "Cascadia Mono", Consolas, monospace';
  context.fillText("WITNESS", 170, 2135);
  context.fillText(String(marks.length).padStart(3, "0"), 170, 2185);
  context.fillText("SEEN", 520, 2135);
  context.fillText(formatDuration(secondsSeen), 520, 2185);
  context.fillText("ACT", 950, 2135);
  context.fillText(String(act).toUpperCase(), 950, 2185);
  context.fillText("FIELD", 1260, 2135);
  context.fillText(signature.toUpperCase(), 1260, 2185);

  context.fillStyle = "#596663";
  context.font = '18px "Microsoft YaHei UI", sans-serif';
  context.fillText(`创作时间 ${formatDuration(creationDuration)} · 本地生成 · 没有上传任何观看记录`, 170, 2290);
  context.textAlign = "right";
  context.fillText("2026.08.20 / 09", 1630, 2290);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("PNG export failed"))), "image/png");
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `after-three-hours-${signature}.png`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
  return { signature, size: blob.size };
}
