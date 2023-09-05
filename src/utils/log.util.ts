import { Argument } from '../models/arguments.model';

/**
 * Log a message if verbose is true.
 * @param param0 The argument to use.
 * @param content The content to log.
 */
export function log<T>({verbose}: Argument<T>, content: string): void {
  if (verbose) console.log(content);
}

/**
 * Format a time duration in a human readable way.
 * Display hours, minutes, seconds and milliseconds. Display only the relevant parts.
 * 
 * @param startPoint The start point of the duration.
 * @returns The formatted duration.
 */
export function formatTimeMesage(startPoint: number): string {
  const duration: number = performance.now() - startPoint;
  const hours: number = Math.floor(duration / 3600000);
  const minutes: number = Math.floor((duration % 3600000) / 60000);
  const seconds: number = Math.floor((duration % 60000) / 1000);
  const milliseconds: number = Math.floor(duration % 1000);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  else if (milliseconds > 0) parts.push(`${milliseconds}ms`);
  return parts.join(' ');
}