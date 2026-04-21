/** SSR-safe stub — real @cofhe/react loads in the browser bundle only. */
import type { ReactNode } from "react";

export function createCofheConfig(_config?: unknown) {
  return {};
}

export function CofheProvider({ children }: { children: ReactNode }) {
  return children;
}

export function useCofheClient() {
  return null;
}

export function useCofheAutoConnect(_opts?: unknown) {}
