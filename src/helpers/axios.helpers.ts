/** `("attachment; filename='video.mp4'") => "video.mp4"` */
export function getFileNameFromContentDisposition(header: string): string {
   return header.split('filename=')[1].replace(/^"(.*)"$/, '$1');
}
