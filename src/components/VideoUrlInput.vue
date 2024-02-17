<script setup lang="ts">
import type { Video } from '../Video';

const props = defineProps(['video']);
const video: Video = props.video;

const VIDEO_URL_LABEL = 'Video URL';
const FILE_NAME_LABEL = 'File name'; // TODO: fix fileName issue
</script>

<template>
   <v-text-field
      clearable
      :label="video.isDownloaded ? FILE_NAME_LABEL : VIDEO_URL_LABEL"
      prepend-icon="mdi-video"
      :loading="video.isLoading"
      :disabled="video.isLoading || video.isDownloaded"
      v-model="video.url"
      class="input-url"
   >
      <template v-slot:append v-if="video.isDownloaded">
         <v-icon color="green">mdi-check</v-icon>
      </template>
   </v-text-field>
</template>

<style scoped>
.input-url {
   width: 65%;
}
</style>
