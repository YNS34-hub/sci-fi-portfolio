import { useEffect, useState } from "react";

function canUseFullWebGL() {
  if (window.matchMedia("(max-width: 768px)").matches) return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
        canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }),
    );
  } catch {
    return false;
  }
}

export function useWebGLSupport() {
  const [supported, setSupported] = useState(canUseFullWebGL);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 768px)");
    const update = () => setSupported(canUseFullWebGL());
    narrow.addEventListener("change", update);
    return () => narrow.removeEventListener("change", update);
  }, []);

  return supported;
}
