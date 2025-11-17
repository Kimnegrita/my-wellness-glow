import { differenceInDays, addDays } from 'date-fns';

export type CyclePhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal' | 'irregular';

export interface CycleInfo {
  currentDay: number;
  phase: CyclePhase;
  daysUntilNext: number;
  nextPeriodDate: Date;
  ovulationDate?: Date;
  fertileWindowStart?: Date;
  fertileWindowEnd?: Date;
  isFertileWindow?: boolean;
}

export function getCurrentCycleDay(
  lastPeriodDate: Date | null,
  avgCycleLength: number | null
): number | null {
  if (!lastPeriodDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastPeriod = new Date(lastPeriodDate);
  lastPeriod.setHours(0, 0, 0, 0);
  
  const daysSinceLastPeriod = differenceInDays(today, lastPeriod);
  
  if (!avgCycleLength) return daysSinceLastPeriod + 1;
  
  // Calculate which day of the cycle we're in
  const cycleDay = (daysSinceLastPeriod % avgCycleLength) + 1;
  return cycleDay;
}

export function getNextPeriodDate(
  lastPeriodDate: Date | null,
  avgCycleLength: number | null
): Date | null {
  if (!lastPeriodDate || !avgCycleLength) return null;
  
  const lastPeriod = new Date(lastPeriodDate);
  return addDays(lastPeriod, avgCycleLength);
}

export function getDaysUntilNextPeriod(nextPeriodDate: Date | null): number | null {
  if (!nextPeriodDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(nextPeriodDate);
  next.setHours(0, 0, 0, 0);
  
  return differenceInDays(next, today);
}

export function getCurrentPhase(cycleDay: number | null, isIrregular: boolean = false): CyclePhase {
  if (isIrregular) return 'irregular';
  if (!cycleDay) return 'irregular';
  
  // Standard cycle phases
  if (cycleDay >= 1 && cycleDay <= 5) return 'menstruation';
  if (cycleDay >= 6 && cycleDay <= 13) return 'follicular';
  if (cycleDay >= 14 && cycleDay <= 16) return 'ovulation';
  if (cycleDay >= 17) return 'luteal';
  
  return 'irregular';
}

export function getOvulationDate(
  lastPeriodDate: Date | null,
  avgCycleLength: number | null
): Date | null {
  if (!lastPeriodDate || !avgCycleLength) return null;
  
  // Ovulation typically occurs 14 days before next period
  const lastPeriod = new Date(lastPeriodDate);
  return addDays(lastPeriod, avgCycleLength - 14);
}

export function getFertileWindow(
  lastPeriodDate: Date | null,
  avgCycleLength: number | null
): { start: Date; end: Date } | null {
  const ovulationDate = getOvulationDate(lastPeriodDate, avgCycleLength);
  if (!ovulationDate) return null;
  
  // Fertile window is typically 5 days before ovulation to 1 day after
  return {
    start: addDays(ovulationDate, -5),
    end: addDays(ovulationDate, 1),
  };
}

export function isInFertileWindow(
  lastPeriodDate: Date | null,
  avgCycleLength: number | null
): boolean {
  const fertileWindow = getFertileWindow(lastPeriodDate, avgCycleLength);
  if (!fertileWindow) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return today >= fertileWindow.start && today <= fertileWindow.end;
}

export function getCycleInfo(
  lastPeriodDate: Date | null,
  avgCycleLength: number | null,
  isIrregular: boolean = false
): CycleInfo | null {
  if (!lastPeriodDate) return null;
  
  const currentDay = getCurrentCycleDay(lastPeriodDate, avgCycleLength);
  const phase = getCurrentPhase(currentDay, isIrregular);
  const nextPeriodDate = getNextPeriodDate(lastPeriodDate, avgCycleLength);
  const daysUntilNext = getDaysUntilNextPeriod(nextPeriodDate);
  const ovulationDate = getOvulationDate(lastPeriodDate, avgCycleLength);
  const fertileWindow = getFertileWindow(lastPeriodDate, avgCycleLength);
  const isFertileWindow = isInFertileWindow(lastPeriodDate, avgCycleLength);
  
  return {
    currentDay: currentDay || 0,
    phase,
    daysUntilNext: daysUntilNext || 0,
    nextPeriodDate: nextPeriodDate || new Date(),
    ovulationDate: ovulationDate || undefined,
    fertileWindowStart: fertileWindow?.start,
    fertileWindowEnd: fertileWindow?.end,
    isFertileWindow,
  };
}