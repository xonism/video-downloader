<script setup lang="ts">
import { ref, type Ref } from 'vue';
import axios, { type AxiosResponse } from 'axios';
import VideoUrlInput from './components/VideoUrlInput.vue';
import type { Video } from './Video';

const videos: Ref<Video[]> = ref([
   {
      url: '',
      isLoading: false,
      isDownloaded: false,
      title: '',
   },
]);

const downloadingDisabled = ref(false);
const addingDisabled = ref(false);

const isSnackbarDisplayed = ref(false);
const snackbarText = ref('');

function submit() {
   setVideoProcessingStartedState();

   videos.value.forEach(async (video) => {
      if (video.isDownloaded) {
         return;
      }

      video.isLoading = true;

      axios
         .get(`http://localhost:3000/video?url=${video.url}`, {
            responseType: 'blob',
         })
         .then((res) => {
            video.title = getFileName(res.headers);

            initDownloadToComputer(res.data, res.headers);
            video.isLoading = false;
            video.isDownloaded = true;
            setVideoProcessingFinishedState();
         })
         .catch((error) => {
            video.isLoading = false;
            isSnackbarDisplayed.value = true;
            snackbarText.value = error.message;
            setVideoProcessingFinishedState();
         });
   });
}

function initDownloadToComputer(responseData: BlobPart, responseHeaders: AxiosResponse['headers']) {
   const link = document.createElement('a');
   link.href = window.URL.createObjectURL(new Blob([responseData]));
   link.setAttribute('download', getFileName(responseHeaders));

   document.body.appendChild(link);
   link.click();
}

function setVideoProcessingStartedState() {
   downloadingDisabled.value = true;
   addingDisabled.value = true;
}

function setVideoProcessingFinishedState() {
   downloadingDisabled.value = isDownloadingDisabled();
   addingDisabled.value = isAddingDisabled();
}

function addVideo() {
   const newVideo: Video = {
      url: '',
      isLoading: false,
      isDownloaded: false,
      title: '',
   };
   videos.value.push(newVideo);
   downloadingDisabled.value = false;
}

function getFileName(headers: AxiosResponse['headers']): string {
   // attachment; filename="video.mp4" => video.mp4
   return headers['content-disposition'].split('filename=')[1].replace(/^"(.*)"$/, '$1');
}

function isDownloadingDisabled() {
   return (
      videos.value.some((video) => video.isLoading) ||
      videos.value.every((video) => video.isDownloaded)
   );
}

function isAddingDisabled() {
   return videos.value.some((video) => video.isLoading);
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
