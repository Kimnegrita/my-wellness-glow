import { differenceInDays, addDays, parseISO } from 'date-fns';

export type CyclePhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal' | 'irregular';

export interface DailyLog {
  log_date: string;
  period_started: boolean | null;
  period_ended: boolean | null;
}

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

// Encuentra el último periodo registrado en los logs
function findLastPeriodFromLogs(logs: DailyLog[]): Date | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Buscar el log más reciente con period_started = true que sea hoy o en el pasado
  const periodLogs = logs
    .filter(log => {
      const logDate = parseISO(log.log_date);
      return log.period_started && logDate <= today;
    })
    .sort((a, b) => parseISO(b.log_date).getTime() - parseISO(a.log_date).getTime());
  
  return periodLogs.length > 0 ? parseISO(periodLogs[0].log_date) : null;
}

// Determina si hoy está en periodo basándose en los logs
function isCurrentlyInPeriod(logs: DailyLog[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  // Buscar si hay un log de hoy con periodo
  const todayLog = logs.find(log => log.log_date === todayStr);
  return !!(todayLog && (todayLog.period_started || todayLog.period_ended));
}

// Calcula la duración promedio del periodo desde los logs
function getAveragePeriodDuration(logs: DailyLog[]): number {
  const periodGroups: number[] = [];
  let currentPeriodDays = 0;
  let inPeriod = false;
  
  const sortedLogs = [...logs].sort((a, b) => 
    parseISO(a.log_date).getTime() - parseISO(b.log_date).getTime()
  );
  
  for (const log of sortedLogs) {
    const hasPeriod = log.period_started || log.period_ended;
    
    if (hasPeriod && !inPeriod) {
      inPeriod = true;
      currentPeriodDays = 1;
    } else if (hasPeriod && inPeriod) {
      currentPeriodDays++;
    } else if (!hasPeriod && inPeriod) {
      if (currentPeriodDays > 0) {
        periodGroups.push(currentPeriodDays);
      }
      inPeriod = false;
      currentPeriodDays = 0;
    }
  }
  
  // Si estamos en periodo actualmente, agregar esos días también
  if (inPeriod && currentPeriodDays > 0) {
    periodGroups.push(currentPeriodDays);
  }
  
  if (periodGroups.length === 0) return 5; // Default
  
  const sum = periodGroups.reduce((a, b) => a + b, 0);
  return Math.round(sum / periodGroups.length);
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
  
  // Retornar días desde el último periodo + 1 (día 1 es el primer día del periodo)
  return daysSinceLastPeriod + 1;
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

// Helper to get phase name from cycle day
export function getPhaseFromCycleDay(cycleDay: number, cycleLength: number = 28): string {
  if (cycleDay <= 5) {
    return 'Menstrual';
  } else if (cycleDay > 5 && cycleDay <= Math.floor(cycleLength / 2) - 2) {
    return 'Folicular';
  } else if (cycleDay > Math.floor(cycleLength / 2) - 2 && cycleDay <= Math.floor(cycleLength / 2) + 2) {
    return 'Ovulación';
  } else {
    return 'Lútea';
  }
}

export function getCurrentPhase(
  cycleDay: number | null, 
  isIrregular: boolean = false,
  periodDuration: number = 5,
  isInPeriodNow: boolean = false
): CyclePhase {
  if (isIrregular) return 'irregular';
  if (!cycleDay) return 'irregular';
  
  // Si estamos actualmente en periodo, mostrar menstruación
  if (isInPeriodNow) return 'menstruation';
  
  // Fases del ciclo basadas en la duración real del periodo
  if (cycleDay >= 1 && cycleDay <= periodDuration) return 'menstruation';
  if (cycleDay >= periodDuration + 1 && cycleDay <= 13) return 'follicular';
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
  isIrregular: boolean = false,
  logs?: DailyLog[],
  configuredPeriodDuration?: number
): CycleInfo | null {
  if (!lastPeriodDate && !logs) return null;
  
  // Usar datos reales del calendario si están disponibles
  const actualLastPeriod = logs ? findLastPeriodFromLogs(logs) : null;
  const periodToUse = actualLastPeriod || lastPeriodDate;
  
  if (!periodToUse) return null;
  
  const isInPeriodNow = logs ? isCurrentlyInPeriod(logs) : false;
  const periodDuration = configuredPeriodDuration || 
    (logs ? getAveragePeriodDuration(logs) : 5);
  
  const currentDay = getCurrentCycleDay(periodToUse, avgCycleLength);
  const phase = getCurrentPhase(currentDay, isIrregular, periodDuration, isInPeriodNow);
  const nextPeriodDate = getNextPeriodDate(periodToUse, avgCycleLength);
  const daysUntilNext = getDaysUntilNextPeriod(nextPeriodDate);
  const ovulationDate = getOvulationDate(periodToUse, avgCycleLength);
  const fertileWindow = getFertileWindow(periodToUse, avgCycleLength);
  const isFertileWindow = isInFertileWindow(periodToUse, avgCycleLength);
  
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