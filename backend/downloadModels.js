const fs = require('fs');
const https = require('https');
const path = require('path');

// Create models directory
const modelsDir = path.join(__dirname, 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir);
}

// Model files to download
const models = [
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-weights_manifest.json',
    name: 'ssd_mobilenetv1_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/ssd_mobilenetv1_model-shard1',
    name: 'ssd_mobilenetv1_model-shard1'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json',
    name: 'face_landmark_68_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1',
    name: 'face_landmark_68_model-shard1'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/age_gender_model-weights_manifest.json',
    name: 'age_gender_model-weights_manifest.json'
  },
  {
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/age_gender_model-shard1',
    name: 'age_gender_model-shard1'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete the file async
      reject(err);
    });
  });
}

async function downloadModels() {
  console.log('Downloading face detection models...');
  
  try {
    for (const model of models) {
      const dest = path.join(modelsDir, model.name);
      if (!fs.existsSync(dest)) {
        console.log(`Downloading ${model.name}...`);
        await downloadFile(model.url, dest);
      } else {
        console.log(`${model.name} already exists`);
      }
    }
    console.log('All models downloaded successfully!');
  } catch (error) {
    console.error('Error downloading models:', error);
  }
}

// Run the download
downloadModels();