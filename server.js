// server.js
const express = require('express');
const { spawn } = require('child_process');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Configure multer to save files in 'uploads/' folder

const app = express();
const cors = require('cors');
app.use(cors());


app.post('/diagnose', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file was uploaded.');
    }

    // With multer, the file info is stored in req.file
    const imagePath = req.file.path; // The path to the uploaded file

    // Spawn a Python process to handle the image processing
    const pythonProcess = spawn('/Users/mansivyas/git_SkinDisease/SkinDiseaseDiagnosticTool/env/bin/python3.9', ['/Users/mansivyas/git_SkinDisease/SkinDiseaseDiagnosticTool/DiagonsisModel.py', imagePath]);

    pythonProcess.stdout.on('data', (data) => {
      const dataString = data.toString();
      console.log("Data received from Python script:", dataString);
  
      try {
          const results = JSON.parse(dataString);
          res.send(results);
      } catch (error) {
          console.error("Error parsing JSON from Python script:", error);
          res.status(500).send("Error parsing results");
      }
  });
    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).send(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
