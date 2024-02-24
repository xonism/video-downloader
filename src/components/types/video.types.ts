export interface IVideo {
   url: string;
   fileName: string;
   status: VideoStatus;
}

export enum VideoStatus {
   INITIALIZED,
   PENDING,
   DOWNLOADED,
}
