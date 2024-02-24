<script setup lang="ts">
import { VideoStatus, type IVideo } from './types/video.types';

const props = defineProps(['video']);
const video: IVideo = props.video;

const VIDEO_URL_LABEL = 'Video URL';
const FILE_NAME_LABEL = 'Expected file name';
</script>

<template>
   <v-text-field
      v-if="!video.fileName"
      v-model="video.url"
      class="input-field"
      prepend-icon="mdi-video"
      :label="VIDEO_URL_LABEL"
      :disabled="video.status === VideoStatus.PENDING"
      :loading="video.status === VideoStatus.PENDING"
      clearable
   >
   </v-text-field>

   <v-text-field
      v-if="video.fileName"
      v-model="video.fileName"
      class="input-field"
      prepend-icon="mdi-video"
      :label="FILE_NAME_LABEL"
      disabled
   >
      <template v-slot:append v-if="video.status === VideoStatus.DOWNLOADED">
         <v-icon color="green">mdi-check</v-icon>
      </template>
   </v-text-field>
</template>

<style scoped>
.input-field {
   width: 65%;
}
</style>
