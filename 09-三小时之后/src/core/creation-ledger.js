function safeDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function formatDuration(value) {
  const totalSeconds = Math.max(0, Math.floor(Number(value) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function normalizeMilestones(milestones) {
  return (Array.isArray(milestones) ? milestones : [])
    .map((entry) => ({
      at: safeDate(entry?.at),
      label: typeof entry?.label === "string" ? entry.label.trim() : "",
      detail: typeof entry?.detail === "string" ? entry.detail.trim() : "",
    }))
    .filter((entry) => entry.at && entry.label)
    .sort((left, right) => left.at.getTime() - right.at.getTime());
}

export function calculateCreationState(ledger, now = new Date()) {
  const startedAt = safeDate(ledger?.startedAt) ?? new Date(0);
  const currentTime = safeDate(now) ?? startedAt;
  const targetMinutes = Math.max(1, Math.floor(Number(ledger?.targetMinutes) || 180));
  const targetSeconds = targetMinutes * 60;
  const rawElapsed = Math.max(0, Math.floor((currentTime.getTime() - startedAt.getTime()) / 1000));
  const elapsedSeconds = Math.min(targetSeconds, rawElapsed);
  const ratio = elapsedSeconds / targetSeconds;

  return {
    startedAt,
    targetMinutes,
    targetSeconds,
    elapsedSeconds,
    elapsedMinutes: Math.floor(elapsedSeconds / 60),
    remainingSeconds: targetSeconds - elapsedSeconds,
    ratio,
    complete: elapsedSeconds >= targetSeconds,
  };
}
