<script setup lang="ts">
import { ref, type Ref } from 'vue';
import VideoUrlInput from './components/VideoUrlInput.vue';
import { videoService } from './services/VideoService';
import { type IFetchResult } from './types/response.types';
import { getFileNameFromContentDisposition } from './helpers/axios.helpers';
import { type IVideo, VideoStatus } from './components/types/video.types';

const videos: Ref<IVideo[]> = ref([
   {
      url: '',
      fileName: '',
      status: VideoStatus.INITIALIZED,
   },
]);

const downloadingDisabled: Ref<boolean> = ref(false);
const addingDisabled: Ref<boolean> = ref(false);

const isSnackbarDisplayed: Ref<boolean> = ref(false);
const snackbarText: Ref<string> = ref('');

async function submit(): Promise<void> {
   setVideoProcessingStartedState();

   await Promise.all(videos.value.map(processVideo));

   setVideoProcessingFinishedState();
}

function setVideoProcessingStartedState(): void {
   downloadingDisabled.value = true;
   addingDisabled.value = true;
}

function setVideoProcessingFinishedState(): void {
   downloadingDisabled.value = isDownloadingDisabled();
   addingDisabled.value = isAddingDisabled();
}

function isDownloadingDisabled(): boolean {
   return (
      videos.value.some((video) => video.status === VideoStatus.PROCESSING) ||
      videos.value.every((video) => video.status === VideoStatus.DOWNLOADED)
   );
}

function isAddingDisabled(): boolean {
   return videos.value.some((video) => video.status === VideoStatus.PROCESSING);
}

async function processVideo(video: IVideo): Promise<void> {
   if (video.status === VideoStatus.DOWNLOADED) {
      return;
   }

   video.status = VideoStatus.PROCESSING;

   const result: IFetchResult = await videoService.fetchVideo(video.url);

   if (!result.isSuccess) {
      video.status = VideoStatus.INITIALIZED;
      setErrorState(result.error);
      return;
   }

   video.fileName = getFileNameFromContentDisposition(result.headers['content-disposition']);
   initDownloadToComputer(result.data, video.fileName);
   video.status = VideoStatus.DOWNLOADED;
}

function setErrorState(error: string): void {
   snackbarText.value = error;
   isSnackbarDisplayed.value = true;
}

function initDownloadToComputer(responseData: BlobPart, fileName: string): void {
   const link: HTMLAnchorElement = document.createElement('a');
   link.href = window.URL.createObjectURL(new Blob([responseData]));
   link.setAttribute('download', fileName);

   document.body.appendChild(link);
   link.click();
}

function addVideo(): void {
   const newVideo: IVideo = {
      url: '',
      fileName: '',
      status: VideoStatus.INITIALIZED,
   };
   videos.value.push(newVideo);
   downloadingDisabled.value = false;
}
</script>

<template>
   <div class="container">
      <template v-for="(video, index) in videos" :key="index">
         <VideoUrlInput :video="video"></VideoUrlInput>
      </template>

      <v-btn
         size="small"
         rounded="lg"
         elevation="4"
         prepend-icon="mdi-plus"
         variant="tonal"
         :disabled="addingDisabled"
         class="btn-add-video"
         @click="addVideo"
         >Add video</v-btn
      >
      <v-btn
         size="large"
         rounded="lg"
         elevation="4"
         prepend-icon="mdi-cloud-download"
         :disabled="downloadingDisabled"
         class="btn-download"
         @click="submit"
         >Download</v-btn
      >

      <v-snackbar v-model="isSnackbarDisplayed" timeout="5000" color="red-lighten-1">
         {{ snackbarText }}
         <template v-slot:actions>
            <v-btn
               variant="text"
               icon="mdi-close"
               size="x-small"
               @click="isSnackbarDisplayed = false"
            ></v-btn>
         </template>
      </v-snackbar>
   </div>
</template>

<style scoped>
.container {
   display: flex;
   flex-direction: column;
   align-items: center;
   width: 100vw;
   margin-top: 48px;
}

.btn-download {
   margin-top: 24px;
   margin-bottom: 48px;
}
</style>
