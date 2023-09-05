import { Argv, CommandModule } from 'yargs';
import { SortArgument } from '../models/arguments.model';
import { defaultOptionBuilder } from './default.options';
import { sortCommandHandler } from './handlers/sort.handler';

export const sortCommand: CommandModule<SortArgument, SortArgument> = {
  command: 'sort [folder]',
  aliases: ['s'],
  describe: 'Sort an analysed folder content',
  builder: (yargs: Argv<SortArgument>) => defaultOptionBuilder(yargs)
    .positional('folder', {
      describe: 'The folder to sort',
      type: 'string',
      default: '.',
    })
    .option('output', {
      alias: 'o',
      describe: 'Output the result to a file',
      type: 'string',
    })
    .option('pattern', {
      alias: 'p',
      describe: 'Pattern to use to sort the files',
      type: 'string',
      default: '{year}{separator}{year}-{month}{separator}{year}-{month}-{day}{separator}{file_name}',
    }),
  handler: sortCommandHandler(),
};