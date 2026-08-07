export type ToastTone = "info" | "success" | "error";

export type ToastPayload = {
  message: string;
  tone?: ToastTone;
  durationMs?: number;
};

const EVENT = "jk-toast";

export function toast(message: string, tone: ToastTone = "info", durationMs = 2800) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToastPayload>(EVENT, {
      detail: { message, tone, durationMs },
    }),
  );
}

export function onToast(handler: (payload: ToastPayload) => void) {
  const listener = (event: Event) => {
    const custom = event as CustomEvent<ToastPayload>;
    if (custom.detail?.message) handler(custom.detail);
  };
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}

const NAV_EVENT = "jk-nav-start";

export function startNavigation(label = "Loading…") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(NAV_EVENT, { detail: { label } }),
  );
}

export function onNavigationStart(handler: (label: string) => void) {
  const listener = (event: Event) => {
    const custom = event as CustomEvent<{ label?: string }>;
    handler(custom.detail?.label || "Loading…");
  };
  window.addEventListener(NAV_EVENT, listener);
  return () => window.removeEventListener(NAV_EVENT, listener);
}
