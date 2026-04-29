"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function Portal({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient();
  if (!isClient || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
