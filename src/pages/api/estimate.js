import { IncomingForm } from 'formidable';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), '/public/uploads');
console.log('Uploaded file at:', uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      multiples: false,
    });

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

export default async function handler(req, res) {
  try {
    const { files } = await parseForm(req);

    const file = files.image?.[0] || files.image;

    if (!file?.filepath) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = file.filepath;

    console.log('filePath : ', filePath);

    // Now run the Python script with the file path
    const { exec } = require('child_process');
    console.log('running process...');
    
    exec(`python ./src/scripts/estimate.py "${filePath}"`, (error, stdout, stderr) => {
      if (error || stderr) {
        console.error('Python script error:', error || stderr);
        return res.status(500).json({ error: 'Failed to process image' });
      }

      try {
        const result = JSON.parse(stdout);
        res.status(200).json({ result });
      } catch (e) {
        console.error('Failed to parse output:', stdout);
        res.status(500).json({ error: 'Invalid result from Python script' });
      }
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    res.status(500).json({ error: 'Unexpected server error' });
  }
}
