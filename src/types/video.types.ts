import { type IFetchResult } from './response.types';

export interface IVideoService {
   fetchVideo(url: string): Promise<IFetchResult>;
}
