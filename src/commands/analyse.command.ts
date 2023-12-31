import { Argv, CommandModule } from 'yargs';
import { AnalyseArgument } from '../models/arguments.model';
import { defaultOptionBuilder } from './default.options';
import { analyseCommandHandler } from './handlers/analyse.handler';

/**
 * Analyse command.
 */
export const analyseCommand: CommandModule<AnalyseArgument, AnalyseArgument> = {
  command: 'analyse [folder]',
  aliases: ['a'],
  describe: 'Analyse a folder content',
  builder: (yargs: Argv<AnalyseArgument>) => defaultOptionBuilder(yargs)
    .option('output', {
      alias: 'o',
      describe: 'Output the result to a file',
      type: 'string',
    })
    .option('distance', {
      alias: 'd',
      describe: 'The distance to use for the comparison',
      type: 'number',
      default: 0.15,
    })
    .option('cache', {
      alias: 'c',
      describe: 'Use the cache to speed up the process',
      type: 'boolean',
      default: true,
    }),
  handler: analyseCommandHandler(),
};