<script setup lang="ts">
import type { Video } from '../Video';

const props = defineProps(['video']);
const video: Video = props.video;

const VIDEO_URL_LABEL = 'Video URL';
const FILE_NAME_LABEL = 'Expected file name';
</script>

<template>
   <v-text-field
      v-if="!video.title"
      v-model="video.url"
      class="input-field"
      prepend-icon="mdi-video"
      :label="VIDEO_URL_LABEL"
      :disabled="video.isLoading"
      :loading="video.isLoading"
      clearable
   >
   </v-text-field>

   <v-text-field
      v-if="video.title"
      v-model="video.title"
      class="input-field"
      prepend-icon="mdi-video"
      :label="FILE_NAME_LABEL"
      disabled
   >
      <template v-slot:append v-if="video.isDownloaded">
         <v-icon color="green">mdi-check</v-icon>
      </template>
   </v-text-field>
</template>

<style scoped>
.input-field {
   width: 65%;
}
</style>
