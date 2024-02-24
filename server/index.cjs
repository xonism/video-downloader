/* eslint-disable no-undef */
const express = require('express');
const { getInfo, chooseFormat, downloadFromInfo } = require('ytdl-core');
const fs = require('fs');

const PORT = 3000;
const CLIENT_URL = 'http://localhost:5173';
const OUTPUT_DIR = './out';

const app = express();
app.use(express.json());

app.get('/video', async (request, response) => {
   const videoUrl = request.query.url;

   createOutputDir();

   const result = await fetchVideoInfo(videoUrl);

   if (!result.isSuccess) {
      setResponseHeaders(response);
      response.status(500).send(result.error);
      return;
   }

   const videoInfo = result.data;

   const titleWithoutSymbols = videoInfo.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, ' ');

   const videoFormats = getFilteredAndSortedFormats(videoInfo.formats);

   // error when options.format is not provided
   const format = chooseFormat(videoFormats, { format: '' });

   const outputFilePath = `${OUTPUT_DIR}/${titleWithoutSymbols}.${format.container}`;
   const writeStream = fs.createWriteStream(outputFilePath);

   downloadFromInfo(videoInfo, { format: format }).pipe(writeStream);

   writeStream.on('finish', () => {
      setResponseHeaders(response);
      response.download(outputFilePath, `${titleWithoutSymbols}.${format.container}`);

      fs.stat(outputFilePath, (error, stats) => {
         if (error) {
            logError(error);
            return;
         }

         logDownload(stats.size, titleWithoutSymbols);
         removeDownloadedFile(outputFilePath);
      });
   });
});

function createOutputDir() {
   if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
   }
}

async function fetchVideoInfo(url) {
   try {
      const videoInfo = await getInfo(url);

      return {
         isSuccess: true,
         data: videoInfo,
      };
   } catch (error) {
      return {
         isSuccess: false,
         error: error,
      };
   }
}

function setResponseHeaders(response) {
   response.setHeader('Access-Control-Allow-Origin', CLIENT_URL);
   response.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
}

/**
 * Filters formats that have video & audio.
 *
 * Sorts formats by descending quality since `ytdl` assumes the first format is highest quality & returns it as the chosen format.
 */
function getFilteredAndSortedFormats(videoFormats) {
   return videoFormats
      .filter((format) => format.hasVideo && format.hasAudio)
      .sort((format1, format2) => format2.height - format1.height);
}

function logError(error) {
   if (!error) {
      return;
   }

   console.error(error);
}

function logDownload(sizeInBytes, titleWithoutSymbols) {
   const fileSize = (sizeInBytes / 1024 / 1024).toFixed(1);
   console.log(`[${getCurrentDateTime()}] 📥 Downloaded: ${titleWithoutSymbols} (${fileSize} Mb)`);
}

function getCurrentDateTime() {
   let date = new Date();
   const offset = date.getTimezoneOffset();
   date = new Date(date.getTime() - offset * 60 * 1000);
   return date.toISOString();
}

function removeDownloadedFile(outputFilePath) {
   fs.rm(outputFilePath, logError);
}

// eslint-disable-next-line no-unused-vars
function createFormatJsonFile(titleWithoutSymbols, videoFormats) {
   const jsonOutputFilePath = `${OUTPUT_DIR}/${titleWithoutSymbols}.json`;
   fs.writeFile(jsonOutputFilePath, JSON.stringify(videoFormats), logError);
}

app.listen(PORT, () => {
   console.log(`Express running on port ${PORT}`);
});
