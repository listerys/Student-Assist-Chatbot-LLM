const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: '../api/resources' });

const DATA_FILE = '../src/Homescreen/data.json';

// Ensure data file exists
fs.ensureFileSync(DATA_FILE);
fs.writeJsonSync(DATA_FILE, { notebooks: [] }, { spaces: 2, EOL: '\n' });

app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const { notebookName } = req.body;
    const notebookFolder = `../api/resources/${notebookName}`;

    // Ensure the notebook folder exists
    await fs.ensureDir(notebookFolder);

    // Iterate over each file and move it to the notebook folder
    for (const file of req.files) {
      const fileDest = path.join(notebookFolder, file.originalname);

      // Check if the destination file already exists
      if (await fs.pathExists(fileDest)) {
        // Overwrite the existing file
        await fs.move(file.path, fileDest, { overwrite: true });
      } else {
        await fs.move(file.path, fileDest);
      }

      // Update the JSON file
      const data = await fs.readJson(DATA_FILE);
      let notebook = data.notebooks.find(nb => nb.Name === notebookName);
      if (!notebook) {
        notebook = {
          Name: notebookName,
          Description: "",
          NotebookID: "NB" + (data.notebooks.length + 1).toString().padStart(3, '0'),
          FileCounts: 0,
          Files: {}
        };
        data.notebooks.push(notebook);
      }

      // Increment file count and add file details
      notebook.FileCounts++;
      notebook.Files['File' + notebook.FileCounts] = {
        Name: file.originalname,
        Type: "Document",
        Link: `http://localhost:3000/${notebookName}/${file.originalname}`
      };

      await fs.writeJson(DATA_FILE, data, { spaces: 2, EOL: '\n' });
    }

    res.send({ message: "Files uploaded successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error uploading files." });
  }
});

app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
