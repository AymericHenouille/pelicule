export type TransformProgressStatus = 'progress' | 'done' | 'error';

export type TransformProgress = {
  status: TransformProgressStatus;
  progress?: {
    stepName: string;
    target: string;
    step: number;
    total: number;
  };
}

export type TransformUpdater = (progress: TransformProgress) => void;

/**
 * Transformer interface
 * It allows to transform an item into one another.
 * @template T The type of the items to transform.
 * @template R The type of the transformed items.
 */
export interface Transformer<T, R> {
  /**
   * The name of the transformer.
   */
  transformerName: string;
  /**
   * Transform an item.
   * @param item The item to transform.
   * @returns The transformed items.
   */
  transform(item: T): Promise<R>;
}

/**
 * A TransformerProcessor allows to transform a list of items.
 * 
 * It uses a list of transformers to transform the items.
 * 
 * @template T The type of the items to transform.
 * @template R The type of the transformed items.
 */
export abstract class TransformerProcessor<T, R> {

  /**
   * Creates a new TransformerProcessor instance.
   * @param transformers The list of transformers to use.
   */
  public constructor(
    protected readonly transformers: Transformer<T, R>[], 
  ) { }

  public abstract transform(inputList: T[], updateStatus: TransformUpdater): Promise<R[]>;
}