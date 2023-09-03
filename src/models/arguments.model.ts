/**
 * Default argument for all commands.
 */
export type Argument<T> = {
  recurcive: boolean,
  verbose: boolean,
  workers: number,
} & T;

/**
 * Argument for analyse command.
 */
export type AnalyseArgument = Argument<{
  folder: string,
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
