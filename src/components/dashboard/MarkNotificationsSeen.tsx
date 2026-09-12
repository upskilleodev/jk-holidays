"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Clears the unread badge once the member opens the notifications page. */
export function MarkNotificationsSeen({ unread }: { unread: number }) {
  const router = useRouter();

  useEffect(() => {
    if (unread < 1) return;
    let alive = true;

    (async () => {
      await fetch("/api/member/notifications/seen", { method: "POST" }).catch(
        () => null,
      );
      if (alive) router.refresh();
    })();

    return () => {
      alive = false;
    };
  }, [unread, router]);

  return null;
}
