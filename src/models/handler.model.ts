import { ArgumentsCamelCase } from 'yargs';

/**
 * Command handler.
 * @param T The command arguments type.
 * @returns The command handler.
 * @example
 * export function analyseCommandHandler(): CommandHandler<AnalyseArgument> {
 *  return (argv: AnalyseArgument) => {
 *   console.log('analyseCommandHandler', argv);
 *  };
 * }
 */
export type CommandHandler<T> = (argv: ArgumentsCamelCase<T>) => void | Promise<void>;

