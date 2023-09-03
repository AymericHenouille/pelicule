"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTimeMesage = exports.log = void 0;
/**
 * Log a message if verbose is true.
 * @param param0 The argument to use.
 * @param content The content to log.
 */
function log({ verbose }, content) {
    if (verbose)
        console.log(content);
}
exports.log = log;
/**
 * Format a time duration in a human readable way.
 * Display hours, minutes, seconds and milliseconds. Display only the relevant parts.
 *
 * @param duration The duration to format.
 * @returns The formatted duration.
 */
function formatTimeMesage(duration) {
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    const milliseconds = Math.floor(duration % 1000);
    const parts = [];
    if (hours > 0)
        parts.push(`${hours}h`);
    if (minutes > 0)
        parts.push(`${minutes}m`);
    if (seconds > 0)
        parts.push(`${seconds}s`);
    else if (milliseconds > 0)
        parts.push(`${milliseconds}ms`);
    return parts.join(' ');
}
exports.formatTimeMesage = formatTimeMesage;
