import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type FieldMode = "pressure" | "drift" | "echo";

export type FieldStats = {
  points: number;
  maxDeviation: number;
  energy: number;
  pulses: number;
};

export type DeviationFieldHandle = {
  clear: () => void;
  pulse: () => void;
  exportArtwork: () => void;
};

type Point = {
  x: number;
  y: number;
  force: number;
};

type Pulse = {
  x: number;
  y: number;
  startedAt: number;
};

type DeviationFieldProps = {
  mode: FieldMode;
  reducedMotion: boolean;
  onStats: (stats: FieldStats) => void;
  onImpulse: (strength: number) => void;
};

const PAPER = "#ece9df";
const INK = "#151512";
const SIGNAL = "#b63627";

function drawSmoothPath(
  context: CanvasRenderingContext2D,
  points: Point[],
  scaleX = 1,
  scaleY = 1,
) {
  if (points.length < 2) return;

  context.beginPath();
  context.moveTo(points[0].x * scaleX, points[0].y * scaleY);

  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midpointX = ((current.x + next.x) / 2) * scaleX;
    const midpointY = ((current.y + next.y) / 2) * scaleY;
    context.quadraticCurveTo(
      current.x * scaleX,
      current.y * scaleY,
      midpointX,
      midpointY,
    );
  }

  const finalPoint = points[points.length - 1];
  context.lineTo(finalPoint.x * scaleX, finalPoint.y * scaleY);
  context.stroke();
}

const DeviationField = forwardRef<DeviationFieldHandle, DeviationFieldProps>(
  function DeviationField({ mode, reducedMotion, onStats, onImpulse }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number | null>(null);
    const sizeRef = useRef({ width: 1, height: 1, dpr: 1 });
    const pointerRef = useRef({
      x: 0,
      y: 0,
      previousX: 0,
      previousY: 0,
      active: false,
      down: false,
    });
    const traceRef = useRef<Point[]>([]);
    const pulsesRef = useRef<Pulse[]>([]);
    const statsRef = useRef<FieldStats>({
      points: 0,
      maxDeviation: 0,
      energy: 0,
      pulses: 0,
    });
    const lastStatsReportRef = useRef(0);
    const modeRef = useRef(mode);
    const reducedMotionRef = useRef(reducedMotion);

    useEffect(() => {
      modeRef.current = mode;
    }, [mode]);

    useEffect(() => {
      reducedMotionRef.current = reducedMotion;
    }, [reducedMotion]);

    const addPulse = (x?: number, y?: number) => {
      const { width, height } = sizeRef.current;
      const pulseX = x ?? (pointerRef.current.active ? pointerRef.current.x : width / 2);
      const pulseY = y ?? (pointerRef.current.active ? pointerRef.current.y : height / 2);
      pulsesRef.current.push({ x: pulseX, y: pulseY, startedAt: performance.now() });
      pulsesRef.current = pulsesRef.current.slice(-8);
      statsRef.current.pulses += 1;
      statsRef.current.energy = Math.min(100, statsRef.current.energy + 18);
      onImpulse(0.75);
    };

    const clearTrace = () => {
      traceRef.current = [];
      pulsesRef.current = [];
      statsRef.current = {
        points: 0,
        maxDeviation: 0,
        energy: 0,
        pulses: 0,
      };
      onStats({ ...statsRef.current });
    };

    const exportArtwork = () => {
      const sourceSize = sizeRef.current;
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 1600;
      exportCanvas.height = 2000;
      const context = exportCanvas.getContext("2d");
      if (!context) return;

      context.fillStyle = PAPER;
      context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      context.strokeStyle = "rgba(21, 21, 18, 0.13)";
      context.lineWidth = 1;
      const margin = 96;
      const spacing = 64;
      for (let x = margin; x <= exportCanvas.width - margin; x += spacing) {
        context.beginPath();
        context.moveTo(x, 410);
        context.lineTo(x, 1700);
        context.stroke();
      }
      for (let y = 420; y <= 1700; y += spacing) {
        context.beginPath();
        context.moveTo(margin, y);
        context.lineTo(exportCanvas.width - margin, y);
        context.stroke();
      }

      context.fillStyle = INK;
      context.font = "600 104px Geist, 'Segoe UI', sans-serif";
      context.fillText("一毫米之外", margin, 175);
      context.font = "500 48px Geist, 'Segoe UI', sans-serif";
      context.fillText("ONE MILLIMETRE OFF", margin, 250);
      context.font = "500 20px Geist, 'Segoe UI', sans-serif";
      context.fillText("A LOCAL RECORD OF CONTROL AND DEVIATION", margin, 310);

      const trace = traceRef.current;
      if (trace.length > 1) {
        const availableWidth = exportCanvas.width - margin * 2;
        const availableHeight = 1180;
        const scaleX = availableWidth / Math.max(1, sourceSize.width);
        const scaleY = availableHeight / Math.max(1, sourceSize.height);
        context.save();
        context.translate(margin, 445);
        context.strokeStyle = SIGNAL;
        context.lineWidth = 14;
        context.globalAlpha = 0.92;
        drawSmoothPath(context, trace, scaleX, scaleY);
        context.strokeStyle = INK;
        context.lineWidth = 4;
        context.globalAlpha = 1;
        drawSmoothPath(context, trace, scaleX, scaleY);
        context.restore();
      } else {
        context.strokeStyle = SIGNAL;
        context.lineWidth = 10;
        context.beginPath();
        context.arc(exportCanvas.width / 2 + 14, 1030 - 14, 92, 0, Math.PI * 2);
        context.stroke();
      }

      context.fillStyle = INK;
      context.font = "500 22px Geist, 'Segoe UI', sans-serif";
      context.fillText(
        `TRACE ${String(statsRef.current.points).padStart(3, "0")}`,
        margin,
        1825,
      );
      context.fillText(
        `DEVIATION ${statsRef.current.maxDeviation.toFixed(1)} MM`,
        520,
        1825,
      );
      context.fillText(
        `PULSE ${String(statsRef.current.pulses).padStart(2, "0")}`,
        1120,
        1825,
      );
      context.fillStyle = SIGNAL;
      context.fillRect(margin, 1882, exportCanvas.width - margin * 2, 10);
      context.fillStyle = INK;
      context.font = "400 18px Geist, 'Segoe UI', sans-serif";
      context.fillText(
        new Intl.DateTimeFormat("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
        margin,
        1950,
      );
      context.textAlign = "right";
      context.fillText("ONE-MILLIMETRE-OFF / LOCAL EDITION", 1504, 1950);

      exportCanvas.toBlob((blob) => {
        if (!blob) return;
        const anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(blob);
        anchor.download = `one-millimetre-off-${Date.now()}.png`;
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
      }, "image/png");
    };

    useImperativeHandle(
      ref,
      () => ({
        clear: clearTrace,
        pulse: () => addPulse(),
        exportArtwork,
      }),
      [],
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        sizeRef.current = { width: rect.width, height: rect.height, dpr };
        pointerRef.current.x ||= rect.width / 2;
        pointerRef.current.y ||= rect.height / 2;
        pointerRef.current.previousX ||= rect.width / 2;
        pointerRef.current.previousY ||= rect.height / 2;
      };

      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      let isVisible = true;
      let lastRenderedAt = 0;
      const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        { rootMargin: "160px" },
      );
      visibilityObserver.observe(canvas);

      const draw = (time: number) => {
        const minimumFrameInterval = reducedMotionRef.current ? 72 : 0;
        if (
          !isVisible ||
          document.hidden ||
          time - lastRenderedAt < minimumFrameInterval
        ) {
          frameRef.current = requestAnimationFrame(draw);
          return;
        }
        lastRenderedAt = time;

        const { width, height, dpr } = sizeRef.current;
        const pointer = pointerRef.current;
        const activeMode = modeRef.current;
        const isReduced = reducedMotionRef.current;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, width, height);

        const spacing = width < 720 ? 42 : 58;
        const columns = Math.ceil(width / spacing) + 2;
        const rows = Math.ceil(height / spacing) + 2;
        const driftTime = isReduced ? 0 : time * 0.00035;

        context.lineWidth = 0.75;
        for (let row = -1; row < rows; row += 1) {
          for (let column = -1; column < columns; column += 1) {
            const baseX = column * spacing + spacing * 0.5;
            const baseY = row * spacing + spacing * 0.5;
            const dx = baseX - pointer.x;
            const dy = baseY - pointer.y;
            const distance = Math.hypot(dx, dy);
            const influence = pointer.active ? Math.max(0, 1 - distance / 250) : 0;
            let offsetX = 0;
            let offsetY = 0;

            if (activeMode === "pressure") {
              const direction = distance === 0 ? 0 : influence * influence * 22;
              offsetX = (dx / Math.max(1, distance)) * direction;
              offsetY = (dy / Math.max(1, distance)) * direction;
            } else if (activeMode === "drift") {
              offsetX = Math.sin(driftTime + row * 0.64) * 5 + influence * 7;
              offsetY = Math.cos(driftTime * 0.8 + column * 0.47) * 4 - influence * 5;
            } else {
              offsetX = Math.sin(driftTime + row * 0.5) * 2 - influence * 9;
              offsetY = Math.cos(driftTime + column * 0.5) * 2 + influence * 9;
            }

            const x = baseX + offsetX;
            const y = baseY + offsetY;
            const crossSize = 3.4 + influence * 5;
            context.strokeStyle = `rgba(21, 21, 18, ${0.14 + influence * 0.32})`;
            context.beginPath();
            context.moveTo(x - crossSize, y);
            context.lineTo(x + crossSize, y);
            context.moveTo(x, y - crossSize);
            context.lineTo(x, y + crossSize);
            context.stroke();

            if (activeMode === "echo" && influence > 0.06) {
              context.strokeStyle = `rgba(182, 54, 39, ${influence * 0.5})`;
              context.beginPath();
              context.moveTo(x + 7 - crossSize, y - 7);
              context.lineTo(x + 7 + crossSize, y - 7);
              context.moveTo(x + 7, y - 7 - crossSize);
              context.lineTo(x + 7, y - 7 + crossSize);
              context.stroke();
            }
          }
        }

        context.strokeStyle = "rgba(21, 21, 18, 0.28)";
        context.lineWidth = 1;
        context.setLineDash([3, 7]);
        context.beginPath();
        context.moveTo(width / 2, 0);
        context.lineTo(width / 2, height);
        context.moveTo(0, height / 2);
        context.lineTo(width, height / 2);
        context.stroke();
        context.setLineDash([]);

        const trace = traceRef.current;
        if (trace.length > 1) {
          if (activeMode === "echo") {
            context.save();
            context.translate(8, -8);
            context.strokeStyle = "rgba(182, 54, 39, 0.72)";
            context.lineWidth = 7;
            drawSmoothPath(context, trace);
            context.restore();
          }
          context.strokeStyle = INK;
          context.lineWidth = activeMode === "pressure" ? 3.2 : 2.2;
          context.lineCap = "round";
          context.lineJoin = "round";
          drawSmoothPath(context, trace);
        }

        const now = performance.now();
        pulsesRef.current = pulsesRef.current.filter((pulse) => now - pulse.startedAt < 1600);
        pulsesRef.current.forEach((pulse) => {
          const progress = Math.min(1, (now - pulse.startedAt) / 1600);
          const radius = 18 + progress * Math.min(width, height) * 0.32;
          context.strokeStyle = `rgba(182, 54, 39, ${(1 - progress) * 0.72})`;
          context.lineWidth = Math.max(0.5, 3 * (1 - progress));
          context.beginPath();
          context.arc(pulse.x, pulse.y, radius, 0, Math.PI * 2);
          context.stroke();
        });

        if (pointer.active) {
          context.strokeStyle = "rgba(21, 21, 18, 0.76)";
          context.lineWidth = 1;
          context.beginPath();
          context.arc(pointer.x, pointer.y, pointer.down ? 26 : 18, 0, Math.PI * 2);
          context.stroke();
          context.fillStyle = SIGNAL;
          context.beginPath();
          context.arc(pointer.x + 3, pointer.y - 3, 3.4, 0, Math.PI * 2);
          context.fill();
        }

        statsRef.current.energy *= isReduced ? 0.9 : 0.97;
        if (time - lastStatsReportRef.current > 220) {
          lastStatsReportRef.current = time;
          onStats({
            ...statsRef.current,
            energy: Math.max(0, Math.round(statsRef.current.energy)),
          });
        }

        frameRef.current = requestAnimationFrame(draw);
      };

      frameRef.current = requestAnimationFrame(draw);
      return () => {
        observer.disconnect();
        visibilityObserver.disconnect();
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      };
    }, [onStats]);

    const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const updatePointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
      const next = pointFromEvent(event);
      const pointer = pointerRef.current;
      const speed = Math.hypot(next.x - pointer.previousX, next.y - pointer.previousY);
      pointer.previousX = pointer.x;
      pointer.previousY = pointer.y;
      pointer.x = next.x;
      pointer.y = next.y;
      pointer.active = true;
      statsRef.current.energy = Math.min(100, statsRef.current.energy + speed * 0.36);

      if (pointer.down) {
        const trace = traceRef.current;
        const previous = trace[trace.length - 1];
        if (!previous || Math.hypot(next.x - previous.x, next.y - previous.y) > 3.5) {
          trace.push({ x: next.x, y: next.y, force: Math.min(1, speed / 26) });
          if (trace.length > 900) trace.shift();
          statsRef.current.points = trace.length;
          if (trace.length > 1) {
            const deviation = Math.min(
              99,
              Math.hypot(next.x - trace[0].x, next.y - trace[0].y) / 12,
            );
            statsRef.current.maxDeviation = Math.max(
              statsRef.current.maxDeviation,
              deviation,
            );
          }
          if (trace.length % 18 === 0) onImpulse(Math.min(0.8, speed / 35));
        }
      }
    };

    return (
      <canvas
        ref={canvasRef}
        className="deviation-field"
        role="img"
        aria-label="可交互的偏差校准场。移动指针影响网格，按住并拖动留下轨迹。"
        onPointerEnter={updatePointer}
        onPointerMove={updatePointer}
        onPointerDown={(event) => {
          const point = pointFromEvent(event);
          event.currentTarget.setPointerCapture(event.pointerId);
          pointerRef.current.down = true;
          pointerRef.current.active = true;
          pointerRef.current.x = point.x;
          pointerRef.current.y = point.y;
          traceRef.current.push({ x: point.x, y: point.y, force: 0.5 });
          statsRef.current.points = traceRef.current.length;
          addPulse(point.x, point.y);
        }}
        onPointerUp={(event) => {
          pointerRef.current.down = false;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onPointerCancel={() => {
          pointerRef.current.down = false;
        }}
        onPointerLeave={() => {
          pointerRef.current.active = false;
          pointerRef.current.down = false;
        }}
      />
    );
  },
);

export default DeviationField;
