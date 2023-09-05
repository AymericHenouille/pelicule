import { MediaInfo } from '../models/report.model';
import { Transformer } from '../models/transform.model';
import { ChainTransformerProcessor } from './chain-processor.transformer';

/**
 * MediaInfoChainTransformerProcessor allows to chain a list of transformers of MediaInfo.
 */
export class MediaInfoChainTransformerProcessor extends ChainTransformerProcessor<MediaInfo> {

  public constructor(
    transformers: Transformer<Partial<MediaInfo>, Partial<MediaInfo>>[],
  ) { 
    super(
      transformers, 
      (item: Partial<MediaInfo>) => item.path ?? ''
    ); 
  }

}