import { type IVideoService } from '../types/video-service.types';
import { type IFetchResult } from '../types/response.types';
import axios from 'axios';

class VideoService implements IVideoService {
   async fetchVideo(url: string): Promise<IFetchResult> {
      try {
         const response = await axios.get(`http://localhost:3000/video?url=${url}`, {
            responseType: 'blob',
         });

         return {
            isSuccess: true,
            data: response.data,
            headers: response.headers,
         };
      } catch (error: any) {
         return {
            isSuccess: false,
            error: error.message,
         };
      }
   }
}

export const videoService: IVideoService = new VideoService();
