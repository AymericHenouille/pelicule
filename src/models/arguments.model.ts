/**
 * Default argument for all commands.
 */
export type Argument<T> = {
  folder: string,
  recurcive: boolean,
  verbose: boolean,
  workers: number,
} & T;

/**
 * Argument for analyse command.
 */
export type AnalyseArgument = Argument<{
  recurcive: boolean,
  distance: number,
  output?: string,
  cache: boolean
}>;

/**
 * Argument for sort command.
 */
export type SortArgument = Argument<{
  folder: string,
  pattern: string,
  output?: string,
}>;
