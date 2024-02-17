/* eslint-disable no-undef */
const express = require('express');
const { getInfo, chooseFormat, downloadFromInfo } = require('ytdl-core');
const fs = require('fs');

const PORT = 3000;
const CLIENT_URL = 'http://localhost:5173';
const OUTPUT_DIR = './out';

const app = express();
app.use(express.json());

app.get('/video', (request, response) => {
   const videoUrl = request.query.url;

   createOutputDir();

   getInfo(videoUrl)
      .then((info) => {
         const titleWithoutSymbols = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, ' ');

         const videoFormats = getFilteredAndSortedFormats(info.formats);
         const format = chooseFormat(videoFormats, { format: '' }); // error when options.format is not provided

         const outputFilePath = `${OUTPUT_DIR}/${titleWithoutSymbols}.${format.container}`;
         const writeStream = fs.createWriteStream(outputFilePath);

         downloadFromInfo(info, { format: format }).pipe(writeStream);

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
      })
      .catch((error) => {
         setResponseHeaders(response);
         response.status(500).send(error);
      });
});

function createOutputDir() {
   if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
   }
}

function getFilteredAndSortedFormats(videoFormats) {
   return videoFormats
      .filter((format) => format.hasVideo && format.hasAudio)
      .sort((format1, format2) => format2.height - format1.height);
}

function setResponseHeaders(response) {
   response.setHeader('Access-Control-Allow-Origin', CLIENT_URL);
   response.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
}

function logDownload(sizeInBytes, titleWithoutSymbols) {
   const fileSize = (sizeInBytes / 1024 / 1024).toFixed(1);
   console.log(`[${getCurrentDate()}] 📥 Downloaded: ${titleWithoutSymbols} (${fileSize} Mb)`);
}

function removeDownloadedFile(outputFilePath) {
   fs.rm(outputFilePath, logError);
}

function getCurrentDate() {
   let date = new Date();
   const offset = date.getTimezoneOffset();
   date = new Date(date.getTime() - offset * 60 * 1000);
   return date.toISOString();
}

function logError(error) {
   if (!error) {
      return;
   }

   console.error(error);
}

// eslint-disable-next-line no-unused-vars
function createFormatJsonFile(titleWithoutSymbols, videoFormats) {
   const jsonOutputFilePath = `${OUTPUT_DIR}/${titleWithoutSymbols}.json`;
   fs.writeFile(jsonOutputFilePath, JSON.stringify(videoFormats), logError);
}

app.listen(PORT, () => {
   console.log(`Express running on port ${PORT}`);
});
