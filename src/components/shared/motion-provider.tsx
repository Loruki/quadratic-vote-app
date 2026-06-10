'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Global framer-motion policy: honor the OS "reduce motion" preference.
 * Without this, every motion.* component animates regardless of the user
 * setting — and Playwright's reducedMotion emulation has no effect either.
 * Transform/layout animations are skipped for those users; opacity still
 * transitions, so state changes stay perceivable.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
