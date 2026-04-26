import { useEffect, useRef, useState } from "react";
import type { CareReminderType, PetType } from "../types/pet";

// ── Practical intervals (milliseconds) ──────────────────────────────────────
const PRACTICAL_INTERVALS: Record<CareReminderType, number> = {
  feed:  6 * 60 * 60 * 1000,  // 6 hours
  water: 4 * 60 * 60 * 1000,  // 4 hours
  play:  3 * 60 * 60 * 1000,  // 3 hours
  walk:  5 * 60 * 60 * 1000,  // 5 hours
};

// ── Demo intervals (milliseconds) ───────────────────────────────────────────
const DEMO_INTERVALS: Record<CareReminderType, number> = {
  feed:  20 * 1000,  // 20 seconds
  water: 30 * 1000,  // 30 seconds
  play:  25 * 1000,  // 25 seconds
  walk:  35 * 1000,  // 35 seconds
};

const REMINDER_ORDER: CareReminderType[] = ["feed", "water", "play", "walk"];

interface Options {
  petType: PetType | null;
  petState: any;
  demoMode: boolean;
}

export function useCareReminders({ petType, petState, demoMode }: Options) {
  const [activeReminder, setActiveReminder] = useState<CareReminderType | null>(null);
  // Track when each action was last performed (or session start)
  const lastActionTime = useRef<Record<CareReminderType, number>>({
    feed:  Date.now(),
    water: Date.now(),
    play:  Date.now(),
    walk:  Date.now(),
  });
  // Which reminder to show next in the cycle
  const reminderIndex = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNext = (fromNow?: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!petType) return;

    const intervals = demoMode ? DEMO_INTERVALS : PRACTICAL_INTERVALS;

    if (demoMode) {
      // Cycle through reminder types one by one
      const type = REMINDER_ORDER[reminderIndex.current % REMINDER_ORDER.length];
      const delay = fromNow ?? intervals[type];
      timerRef.current = setTimeout(() => {
        setActiveReminder(type);
      }, delay);
    } else {
      // Find which reminder is most overdue right now
      const findNextOverdue = () => {
        const now = Date.now();
        const overdue = REMINDER_ORDER.map((type) => ({
          type,
          overdueSince: now - lastActionTime.current[type] - intervals[type],
        })).filter((r) => r.overdueSince >= 0);

        if (overdue.length > 0) {
          // Show the most overdue one
          overdue.sort((a, b) => b.overdueSince - a.overdueSince);
          setActiveReminder(overdue[0].type);
        }
      };

      // Check soonest upcoming reminder
      const now = Date.now();
      const upcoming = REMINDER_ORDER.map((type) => {
        const elapsed = now - lastActionTime.current[type];
        const remaining = intervals[type] - elapsed;
        return { type, remaining: Math.max(0, remaining) };
      }).sort((a, b) => a.remaining - b.remaining);

      const soonest = upcoming[0];
      const delay = fromNow ?? soonest.remaining;

      timerRef.current = setTimeout(() => {
        findNextOverdue();
        // Re-schedule for the next one after this fires
        scheduleNext();
      }, delay > 0 ? delay : 1000);
    }
  };

  // Re-schedule whenever demoMode or petType changes
  useEffect(() => {
    if (!petType) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setActiveReminder(null);
      return;
    }
    setActiveReminder(null);
    scheduleNext(demoMode ? DEMO_INTERVALS.feed : undefined);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [petType, demoMode]);

  const dismissReminder = () => {
    setActiveReminder(null);
    reminderIndex.current += 1;
    scheduleNext();
  };

  const confirmReminder = (type: CareReminderType) => {
    lastActionTime.current[type] = Date.now();
    setActiveReminder(null);
    reminderIndex.current += 1;
    scheduleNext();
  };

  const resetAllReminders = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveReminder(null);
    reminderIndex.current = 0;
    const now = Date.now();
    lastActionTime.current = { feed: now, water: now, play: now, walk: now };
  };

  // When user manually performs an action (outside of reminder), update last time
  const recordAction = (type: CareReminderType) => {
    lastActionTime.current[type] = Date.now();
  };

  return { activeReminder, dismissReminder, confirmReminder, resetAllReminders, recordAction };
}