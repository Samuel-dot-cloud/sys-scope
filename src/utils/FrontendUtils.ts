export enum Unit {
    MB,
    GB
}

export const convertBytes = (value: number, unit: Unit): number => {
  switch (unit) {
      case Unit.MB:
          return value / (1024 * 1024);
      case Unit.GB:
          return value / (1024 * 1024 * 1024);
      default:
          return 0;
  }
}

export const convertTime = (seconds: number): string => {
  if (seconds <= 3600) {
      const minutes = seconds / 60;
      const minuteUnit = minutes.toFixed(0) === "1" ? "minute" : "minutes";
      return `${minutes.toFixed(0)} ${minuteUnit} ago`;
  } else {
      const hours = seconds / 3600;
      const hourUnit = hours.toFixed(0) === "1" ? "hour" : "hours";
      return `${hours.toFixed(0)} ${hourUnit} ago`
  }
}

export const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = secs.toString().padStart(2, '0');

    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
}

export type AppTheme = 'light' | 'dark' | 'auto';