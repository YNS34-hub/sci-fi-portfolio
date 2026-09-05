import { TimeFieldCanvas } from "../art/time-field-canvas.js";
import { TimeAudio } from "../audio/time-audio.js";
import { creationLedger } from "../creation-ledger-data.js";
import { calculateCreationState, formatDuration, normalizeMilestones } from "../core/creation-ledger.js";
import { addMark, createEmptyMemory, loadMemory, saveMemory } from "../core/memory.js";
import { buildFieldSignature } from "../core/time-field.js";
import { exportMoment } from "../export/poster.js";

const MEMORY_KEY = "after-three-hours:witness:v1";
const ENTERED_KEY = "after-three-hours:entered";

const ACT_COPY = {
  hold: {
    chinese: "靠近，但不急着改变。时间先感到你的重量。",
    english: "Stay near. Let time register your weight before it changes.",
  },
  drift: {
    chinese: "偏离不是浪费；它让原本看不见的结构显形。",
    english: "Deviation is not waste. It reveals the structure that certainty hides.",
  },
  leave: {
    chinese: "留下的不是轨迹，而是你曾认真在场的证据。",
    english: "What remains is not a trace, but evidence that you were fully here.",
  },
};

function trySessionValue(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setSessionValue(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // The artwork remains usable when private browsing refuses session storage.
  }
}

function getLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function formatChineseDateTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "未记录";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日 ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatClock(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return "--:--";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function recordedCreationDuration() {
  const startedAt = new Date(creationLedger.startedAt).getTime();
  const completedAt = new Date(creationLedger.completedAt).getTime();
  if (!Number.isFinite(startedAt) || !Number.isFinite(completedAt) || completedAt < startedAt) {
    return creationLedger.targetMinutes * 60;
  }
  return Math.floor((completedAt - startedAt) / 1000);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function template({ entered, reducedMotion, memory }) {
  const controlsInert = entered ? "" : "inert";
  return `
    <main
      class="artwork-shell"
      data-testid="artwork-shell"
      data-act="${memory.lastAct}"
      data-entered="${entered}"
      data-reduced-motion="${reducedMotion}"
      data-has-gesture="${memory.marks.length > 0}"
      aria-label="三小时之后互动时间场"
    >
      <canvas
        class="time-field"
        data-testid="time-field"
        role="img"
        aria-label="由 180 根可被触碰和弯曲的分钟纤维构成的动态时间场"
      >你的浏览器不支持画布，无法显示时间纤维。</canvas>
      <div class="field-veil" aria-hidden="true"></div>

      <header class="edge-header" ${controlsInert}>
        <p class="wordmark" aria-label="三小时之后 / After Three Hours">
          <span class="wordmark__cn">三小时之后</span>
          <span class="wordmark__en">After Three Hours</span>
        </p>
        <dl class="session-reading" aria-label="本次观看读数">
          <dt>session</dt><dd data-session-time>00:00:00</dd>
          <dt>field</dt><dd data-field-signature>${buildFieldSignature(memory.marks)}</dd>
        </dl>
        <div class="utility-actions">
          <button class="utility-button" type="button" data-sound aria-pressed="false" aria-label="声音 关闭">声音 关</button>
          <button class="utility-button" type="button" data-help aria-label="打开操作说明">说明 ?</button>
        </div>
      </header>

      <section class="opening" aria-labelledby="artwork-title" aria-hidden="${entered}" ${entered ? "inert" : ""}>
        <p class="opening__index">09 / An instrument for surrendered time</p>
        <h1 class="opening__title" id="artwork-title">
          <span>三小时之后</span>
          <span class="opening__title-en">After Three Hours</span>
        </h1>
        <div class="opening__aside">
          <p class="opening__lead">你把三小时交给了一个并不知道会发生什么的系统。</p>
          <p class="opening__note">它把这段时间做成一块材料。靠近、按住、缓慢移动；这台电脑会记住有限的痕迹，但不会把它们发送到任何地方。</p>
          <button class="enter-button" type="button" data-enter>进入这三小时</button>
        </div>
        <dl class="opening__measure">
          <div><dt>材料</dt><dd>180 根分钟纤维</dd></div>
          <div><dt>耗时</dt><dd>03:00:00</dd></div>
          <div><dt>依赖</dt><dd>无账号 · 无网络</dd></div>
        </dl>
      </section>

      <div class="instrument-ui" ${controlsInert}>
        <p class="minute-scale" aria-hidden="true"><strong>180</strong><span>minute fibres<br />made from one given evening</span></p>
        <p class="act-copy" aria-live="polite">
          <span class="act-copy__cn" data-act-copy-cn>${ACT_COPY[memory.lastAct].chinese}</span>
          <span class="act-copy__en" data-act-copy-en>${ACT_COPY[memory.lastAct].english}</span>
        </p>
        <p class="gesture-note">按住并缓慢移动<br />PRESS · STAY · MOVE SLOWLY</p>

        <div class="bottom-rail">
          <dl class="witness-reading" aria-label="本地观看痕迹">
            <dt>traces</dt><dd data-testid="trace-count" data-trace-count>${String(memory.marks.length).padStart(3, "0")}</dd>
            <dt>seen</dt><dd data-total-seen>${formatDuration(memory.secondsSeen)}</dd>
          </dl>
          <div class="act-controls" id="act-controls" role="group" aria-label="选择观察方式">
            <button class="act-button" type="button" data-act="hold" aria-pressed="${memory.lastAct === "hold"}">凝视 <span>1 · HOLD</span></button>
            <button class="act-button" type="button" data-act="drift" aria-pressed="${memory.lastAct === "drift"}">偏离 <span>2 · DRIFT</span></button>
            <button class="act-button" type="button" data-act="leave" aria-pressed="${memory.lastAct === "leave"}">留下 <span>3 · LEAVE</span></button>
          </div>
          <div class="archive-actions">
            <button class="archive-button" type="button" data-ledger>创作记录 L</button>
            <button class="archive-button" type="button" data-export>保存这一刻 E</button>
          </div>
        </div>
      </div>
    </main>

    <dialog class="time-dialog" data-ledger-dialog aria-labelledby="ledger-title">
      <div class="dialog-sheet">
        <div>
          <p class="dialog-kicker">PROVENANCE / 180 MINUTES</p>
          <h2 class="dialog-title" id="ledger-title">三小时创作记录</h2>
          <p class="dialog-intro">这不是一段事后补写的宣传。作品把开始时间、阶段节点和实际经过时长一起留下；完成之前，它会诚实显示“进行中”。</p>
          <dl class="creation-span">
            <div><dt>开始</dt><dd>${formatChineseDateTime(creationLedger.startedAt)}</dd></div>
            <div><dt>经过</dt><dd data-ledger-elapsed>00:00:00</dd></div>
            <div><dt>状态</dt><dd data-ledger-status>进行中</dd></div>
          </dl>
          <ol class="milestone-list" data-milestones></ol>
        </div>
        <button class="dialog-close" type="button" data-close-dialog aria-label="关闭创作记录">×</button>
      </div>
    </dialog>

    <dialog class="time-dialog" data-help-dialog aria-labelledby="help-title">
      <div class="dialog-sheet">
        <div>
          <p class="dialog-kicker">HOW TO STAY</p>
          <h2 class="dialog-title" id="help-title">不用学会，只要停留</h2>
          <p class="dialog-intro">快速划过只会惊动表面。按住，移动得慢一点，纤维才会把你的到场留进有限的本地记忆。</p>
          <div class="help-grid">
            <div class="help-row"><span class="help-key">按住</span><span>在时间场留下一个压痕</span></div>
            <div class="help-row"><span class="help-key">1 / 2 / 3</span><span>凝视、偏离、留下</span></div>
            <div class="help-row"><span class="help-key">S</span><span>开启或关闭本地生成声音</span></div>
            <div class="help-row"><span class="help-key">E</span><span>保存当前时间场为 PNG</span></div>
            <div class="help-row"><span class="help-key">L</span><span>查看三小时创作记录</span></div>
            <div class="help-row"><span class="help-key">Esc</span><span>关闭当前说明</span></div>
          </div>
          <p class="privacy-note">隐私：痕迹最多保留 240 个，只写入本机浏览器；没有分析代码、外部图片、API、账户或上传行为。清除后无法恢复。</p>
          <button class="memory-reset" type="button" data-memory-reset data-armed="false">清除本机留下的痕迹</button>
        </div>
        <button class="dialog-close" type="button" data-close-dialog aria-label="关闭操作说明">×</button>
      </div>
    </dialog>
    <p class="live-message" aria-live="polite" aria-atomic="true" data-live-message></p>
  `;
}

export function mountArtwork(root) {
  if (!root) throw new Error("Artwork mount point is missing");

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = reducedMotionQuery.matches;
  let entered = trySessionValue(ENTERED_KEY) === "1";
  const storage = getLocalStorage();
  let memory = loadMemory(storage, MEMORY_KEY);
  memory = { ...memory, visits: Math.min(1_000_000, memory.visits + 1) };
  saveMemory(storage, MEMORY_KEY, memory);

  root.innerHTML = template({ entered, reducedMotion, memory });

  const shell = root.querySelector("[data-testid='artwork-shell']");
  const canvas = root.querySelector("[data-testid='time-field']");
  const opening = root.querySelector(".opening");
  const header = root.querySelector(".edge-header");
  const instrument = root.querySelector(".instrument-ui");
  const enterButton = root.querySelector("[data-enter]");
  const actButtons = [...root.querySelectorAll("[data-act].act-button")];
  const soundButton = root.querySelector("[data-sound]");
  const exportButton = root.querySelector("[data-export]");
  const ledgerButton = root.querySelector("[data-ledger]");
  const helpButton = root.querySelector("[data-help]");
  const ledgerDialog = root.querySelector("[data-ledger-dialog]");
  const helpDialog = root.querySelector("[data-help-dialog]");
  const liveMessage = root.querySelector("[data-live-message]");
  const resetButton = root.querySelector("[data-memory-reset]");
  const renderer = new TimeFieldCanvas(canvas);
  const audio = new TimeAudio();
  let act = memory.lastAct;
  let pointerDown = false;
  let lastRecordedMark = null;
  let sessionSeconds = 0;
  let exportBusy = false;
  let resetTimer = null;

  renderer.setState({ act, marks: memory.marks, reducedMotion, entered });

  function announce(message) {
    liveMessage.textContent = "";
    window.requestAnimationFrame(() => {
      liveMessage.textContent = message;
    });
  }

  function updateReadings() {
    root.querySelector("[data-session-time]").textContent = formatDuration(sessionSeconds);
    root.querySelector("[data-total-seen]").textContent = formatDuration(memory.secondsSeen);
    root.querySelector("[data-trace-count]").textContent = String(memory.marks.length).padStart(3, "0");
    root.querySelector("[data-field-signature]").textContent = buildFieldSignature(memory.marks);
  }

  function persist() {
    saveMemory(storage, MEMORY_KEY, memory);
  }

  function setEntered(nextEntered, moveFocus = true) {
    entered = nextEntered;
    shell.dataset.entered = String(entered);
    opening.setAttribute("aria-hidden", String(entered));
    opening.toggleAttribute("inert", entered);
    header.toggleAttribute("inert", !entered);
    instrument.toggleAttribute("inert", !entered);
    renderer.setState({ entered });
    if (entered) {
      setSessionValue(ENTERED_KEY, "1");
      if (moveFocus) root.querySelector(`[data-act="${act}"].act-button`)?.focus();
      announce("已进入时间场。按住并缓慢移动，可以留下痕迹。");
    }
  }

  function setAct(nextAct, shouldAnnounce = true) {
    if (!ACT_COPY[nextAct]) return;
    act = nextAct;
    memory = { ...memory, lastAct: act };
    shell.dataset.act = act;
    root.querySelector("[data-act-copy-cn]").textContent = ACT_COPY[act].chinese;
    root.querySelector("[data-act-copy-en]").textContent = ACT_COPY[act].english;
    for (const button of actButtons) button.setAttribute("aria-pressed", String(button.dataset.act === act));
    renderer.setState({ act });
    audio.update({ act, pointerEnergy: 0, markCount: memory.marks.length });
    persist();
    if (shouldAnnounce) announce(`观察方式：${act === "hold" ? "凝视" : act === "drift" ? "偏离" : "留下"}`);
  }

  function recordMark(impulse) {
    const mark = {
      x: impulse.x,
      y: impulse.y,
      force: Math.max(0.18, Math.min(1, impulse.energy)),
      t: memory.secondsSeen,
    };
    const distance = lastRecordedMark
      ? Math.hypot(mark.x - lastRecordedMark.x, mark.y - lastRecordedMark.y)
      : Infinity;
    if (distance < 0.012) return;
    lastRecordedMark = mark;
    memory = addMark(memory, mark);
    shell.dataset.hasGesture = "true";
    renderer.setState({ marks: memory.marks });
    audio.update({ act, pointerEnergy: impulse.energy, markCount: memory.marks.length });
    updateReadings();
    persist();
  }

  function renderLedger() {
    const state = calculateCreationState(creationLedger, new Date());
    const recordedDuration = recordedCreationDuration();
    root.querySelector("[data-ledger-elapsed]").textContent = creationLedger.completedAt
      ? formatDuration(recordedDuration)
      : formatDuration(state.elapsedSeconds);
    root.querySelector("[data-ledger-status]").textContent = creationLedger.completedAt
      ? "完成 · 含验收"
      : state.complete
        ? "承诺已满 · 仍在验收"
        : `进行中 · ${state.elapsedMinutes} / 180 分钟`;
    const milestones = normalizeMilestones(creationLedger.milestones);
    root.querySelector("[data-milestones]").innerHTML = milestones
      .map((milestone) => `
        <li class="milestone-item">
          <time class="milestone-time" datetime="${milestone.at.toISOString()}">${formatClock(milestone.at)}</time>
          <span class="milestone-label">${escapeHtml(milestone.label)}</span>
          <span class="milestone-detail">${escapeHtml(milestone.detail)}</span>
        </li>
      `)
      .join("");
  }

  function openDialog(dialog) {
    if (!dialog?.open) dialog.showModal();
  }

  function closeDialogs() {
    if (ledgerDialog.open) ledgerDialog.close();
    if (helpDialog.open) helpDialog.close();
  }

  async function toggleSound() {
    const nextEnabled = !audio.enabled;
    const enabledNow = await audio.setEnabled(nextEnabled);
    soundButton.setAttribute("aria-pressed", String(enabledNow));
    soundButton.setAttribute("aria-label", `声音 ${enabledNow ? "开启" : "关闭"}`);
    soundButton.textContent = `声音 ${enabledNow ? "开" : "关"}`;
    announce(
      enabledNow
        ? "声音已开启。声音由本机实时生成。"
        : nextEnabled
          ? "当前浏览器没有允许声音启动，作品会保持静音。"
          : "声音已关闭。",
    );
  }

  async function exportCurrentMoment() {
    if (exportBusy || !entered) return;
    exportBusy = true;
    exportButton.disabled = true;
    const originalText = exportButton.textContent;
    exportButton.textContent = "正在形成…";
    try {
      const result = await exportMoment({
        memory,
        act,
        secondsSeen: memory.secondsSeen,
        creationDuration: recordedCreationDuration(),
      });
      announce(`这一刻已保存。时间场编号 ${result.signature}。`);
    } catch {
      announce("图像没有生成。请确认浏览器允许下载后再试一次。");
    } finally {
      exportBusy = false;
      exportButton.disabled = false;
      exportButton.textContent = originalText;
    }
  }

  enterButton.addEventListener("click", () => setEntered(true));
  for (const button of actButtons) button.addEventListener("click", () => setAct(button.dataset.act));
  soundButton.addEventListener("click", toggleSound);
  exportButton.addEventListener("click", exportCurrentMoment);
  ledgerButton.addEventListener("click", () => {
    renderLedger();
    openDialog(ledgerDialog);
  });
  helpButton.addEventListener("click", () => openDialog(helpDialog));

  for (const closeButton of root.querySelectorAll("[data-close-dialog]")) {
    closeButton.addEventListener("click", () => closeButton.closest("dialog")?.close());
  }
  for (const dialog of [ledgerDialog, helpDialog]) {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  resetButton.addEventListener("click", () => {
    if (resetButton.dataset.armed !== "true") {
      resetButton.dataset.armed = "true";
      resetButton.textContent = "再次按下，确认清除";
      announce("再次按下按钮，才会清除本机痕迹。");
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        resetButton.dataset.armed = "false";
        resetButton.textContent = "清除本机留下的痕迹";
      }, 4_000);
      return;
    }
    window.clearTimeout(resetTimer);
    memory = { ...createEmptyMemory(), visits: 1, lastAct: act };
    lastRecordedMark = null;
    shell.dataset.hasGesture = "false";
    renderer.setState({ marks: [] });
    persist();
    updateReadings();
    resetButton.dataset.armed = "false";
    resetButton.textContent = "本机痕迹已清除";
    announce("本机留下的痕迹已经清除。");
    window.setTimeout(() => {
      resetButton.textContent = "清除本机留下的痕迹";
    }, 2_000);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!entered) return;
    const impulse = renderer.pointerFromEvent(event);
    renderer.setState({ pointer: impulse });
    audio.update({ act, pointerEnergy: impulse.energy, markCount: memory.marks.length });
    if (pointerDown) recordMark(impulse);
  });
  canvas.addEventListener("pointerdown", (event) => {
    if (!entered) return;
    pointerDown = true;
    lastRecordedMark = null;
    canvas.setPointerCapture?.(event.pointerId);
    const impulse = renderer.pointerFromEvent(event);
    renderer.setState({ pointer: impulse });
    recordMark(impulse);
  });
  const releasePointer = (event) => {
    pointerDown = false;
    lastRecordedMark = null;
    if (event?.pointerId !== undefined && canvas.hasPointerCapture?.(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };
  canvas.addEventListener("pointerup", releasePointer);
  canvas.addEventListener("pointercancel", releasePointer);
  canvas.addEventListener("pointerleave", () => {
    if (!pointerDown) renderer.setState({ pointer: null });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDialogs();
      return;
    }
    if (ledgerDialog.open || helpDialog.open || !entered) return;
    if (["1", "2", "3"].includes(event.key)) {
      event.preventDefault();
      setAct({ 1: "hold", 2: "drift", 3: "leave" }[event.key]);
      return;
    }
    const key = event.key.toLowerCase();
    if (key === "s") {
      event.preventDefault();
      toggleSound();
    } else if (key === "e") {
      event.preventDefault();
      exportCurrentMoment();
    } else if (key === "l") {
      event.preventDefault();
      renderLedger();
      openDialog(ledgerDialog);
    } else if (event.key === "?") {
      event.preventDefault();
      openDialog(helpDialog);
    }
  });

  const onReducedMotionChange = (event) => {
    reducedMotion = event.matches;
    shell.dataset.reducedMotion = String(reducedMotion);
    renderer.setState({ reducedMotion });
  };
  reducedMotionQuery.addEventListener?.("change", onReducedMotionChange);

  window.setInterval(() => {
    if (!entered || document.visibilityState !== "visible") return;
    sessionSeconds += 1;
    memory = { ...memory, secondsSeen: Math.min(315_576_000, memory.secondsSeen + 1) };
    updateReadings();
    if (sessionSeconds % 5 === 0) persist();
  }, 1_000);

  window.addEventListener("beforeunload", persist);
  updateReadings();
  setAct(act, false);
  if (entered) setEntered(true, false);

  window.__AFTER_THREE_HOURS__ = {
    version: "1.0.0",
    getState: () => ({ entered, act, reducedMotion, memory: structuredClone(memory) }),
    renderer,
  };
}
