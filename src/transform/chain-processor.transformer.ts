import chalk from 'chalk';
import { TransformUpdater, Transformer, TransformerProcessor } from '../models/transform.model';

/**
 * ChainTransformerProcessor allows to chain a list of transformers.
 * The chain is done in the order of the list.
 * Each transformer will receive the result of the previous one.
 * 
 * @template T The type of the items to transform.
 */
export class ChainTransformerProcessor<T> extends TransformerProcessor<Partial<T>, Partial<T>> {

  /**
   * The length of the longest step name.
   *
   * @private
   * @type {number}
   * @memberof ChainTransformerProcessor
   */
  private stepNameLength: number = 0;

  private static readonly DONE_MESSAGE: string = 'done';

  /**
   * Creates a new ChainTransformerProcessor instance.
   * @param transformers The list of transformers to chain.
   * @param stepStatusBuilder The function to use to build the status of the current step.
   */
  public constructor(
    protected readonly transformers: Transformer<Partial<T>, Partial<T>>[],
    protected readonly stepStatusBuilder?: (item: Partial<T>) => string,
  ) { 
    super(transformers);
    this.stepNameLength = Math.max(ChainTransformerProcessor.DONE_MESSAGE.length, ...this.transformers.map((transformer) => transformer.transformerName.length));
  }

  /**
   * Creates a new ChainTransformerProcessor instance.
   * @param inputList The list of items to transform.
   * @param updateStatus The function to use to share the progress of the transformation.
   * @returns The list of transformed items.
   */
  public async transform(inputList: Partial<T>[], updateStatus: TransformUpdater<T>): Promise<Partial<T>[]> {
    const outputList: Partial<T>[] = [];
    const total: number = inputList.length;
    for (let step = 0 ; step < total ; ++step) {
      let currentInput: Partial<T> = inputList[step];
      try {
        for (let i = 0 ; i < this.transformers.length ; ++i) {
          const transformer: Transformer<Partial<T>, Partial<T>> = this.transformers[i];
          const stepName: string = chalk.bold.magenta(this.formatStepName(transformer.transformerName));
          updateStatus({ status: 'progress', progress: {
            stepName,
            target: this.stepStatusBuilder ? this.stepStatusBuilder(currentInput) : '',
            step: step + 1,
            total: this.transformers.length,
          } });
          const result: Partial<T> = await transformer.transform(currentInput);
          currentInput = Object.assign(currentInput, result);
        }
      } catch (error) {
        updateStatus({ status: 'error' });
        console.error(error);
      } finally { outputList.push(currentInput); }
    }
    updateStatus({ 
      status: 'done',
      result: (outputList as T[]),
      progress: {
        stepName: chalk.green(this.formatStepName(ChainTransformerProcessor.DONE_MESSAGE)),
        target: '',
        step: total,
        total,
      } 
    });
    return outputList;
  }

  /**
   * Format the step name to have a fixed length.
   * @param stepName The step name to format.
   * @returns The formatted step name.
   */
  private formatStepName(stepName: string): string {
    return `${stepName.padEnd(this.stepNameLength, ' ')}:`.toUpperCase();
  }

}