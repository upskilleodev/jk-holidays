"use client";

import { NavigationFeedback } from "./NavigationFeedback";
import { ToastHost } from "./ToastHost";

export function AppFeedback() {
  return (
    <>
      <NavigationFeedback />
      <ToastHost />
    </>
  );
}
