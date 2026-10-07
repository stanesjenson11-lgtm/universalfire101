import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn's class helper — later Tailwind utilities win over earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Leading + trailing debounce — the one lodash function the fancy components
 * used. ponytail: replaces the whole of lodash (~25kB gz, not tree-shaken).
 */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;
  return (...args: A) => {
    if (!timer) fn(...args);
    else pending = args;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      if (pending) fn(...pending);
      pending = undefined;
    }, wait);
  };
}
