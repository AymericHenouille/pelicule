import { TransformUpdater, Transformer, TransformerProcessor } from '../models/transform.model';

/**
 * ChainTransformerProcessor allows to chain a list of transformers.
 * The chain is done in the order of the list.
 * Each transformer will receive the result of the previous one.
 * 
 * @template T The type of the items to transform.
 */
export class ChainTransformerProcessor<T> extends TransformerProcessor<Partial<T>, Partial<T>> {

  public constructor(
    protected readonly transformers: Transformer<Partial<T>, Partial<T>>[],
    protected readonly stepStatusBuilder?: (item: Partial<T>) => string,
  ) { super(transformers); }

  /**
   * Creates a new ChainTransformerProcessor instance.
   * @param inputList The list of items to transform.
   * @param updateStatus The function to use to share the progress of the transformation.
   * @returns The list of transformed items.
   */
  public async transform(inputList: Partial<T>[], updateStatus: TransformUpdater): Promise<Partial<T>[]> {
    const outputList: Partial<T>[] = [];
    const total: number = inputList.length;
    for (let step = 0 ; step < total ; ++step) {
      const currentInput: Partial<T> = inputList[step];
      try {
        const result: Partial<T> = await this.transformers.reduce(async (previous: Promise<Partial<T>>, transformer) => {
          const previousResult: Partial<T> = await previous;
          const stepName: string = transformer.transformerName;
          updateStatus({ status: 'progress', progress: {
            stepName,
            target: this.stepStatusBuilder ? this.stepStatusBuilder(currentInput) : '',
            step: step + 1,
            total,
          } });
          return transformer.transform(previousResult);
        }, Promise.resolve(currentInput));
        outputList.push(result);
      } catch (error) { console.error(error); }
    }
    updateStatus({ status: 'done' });
    return outputList;
  }

}