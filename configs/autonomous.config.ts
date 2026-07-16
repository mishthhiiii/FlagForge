export const autonomousEnvVars = [
  'AUTONOMOUS_ENABLED',
  'AUTONOMOUS_DAILY_INSPECTION_CRON',
  'AUTONOMOUS_TIMEZONE',
] as const;

export const autonomousDefaults = {
  enabled: false,
  dailyInspectionCron: '0 9 * * *',
  timezone: 'UTC',
} as const;
