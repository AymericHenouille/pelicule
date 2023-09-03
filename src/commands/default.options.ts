import { cpus } from 'os';
import { Argv } from 'yargs';

/**
 * Build the default options for all commands.
 * 
 * @param yargs The yargs instance.
 * @returns The yargs instance with the default optionse
 */
export function defaultOptionBuilder<T>(yargs: Argv<T>): Argv<T> {
  return yargs.option('recurcive', {
      alias: 'r',
      describe: 'Analyse the folder recursively',
      type: 'boolean',
      default: false,
    })
    .option('verbose', {
      alias: 'v',
      describe: 'Verbose output',
      type: 'boolean',
      default: false,
    })
    .option('workers', {
      alias: 'w',
      describe: 'Number of workers',
      type: 'number',
      default: cpus().length,
    });
}
