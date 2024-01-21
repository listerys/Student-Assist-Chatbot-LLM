const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const app = express();
const port = 5000;

const DATA_FILE = '../src/Homescreen/data.json'; // Define the path for the data file

// Ensure data file exists
fs.ensureFileSync(DATA_FILE);
fs.writeJsonSync(DATA_FILE, { notebooks: [] }, { spaces: 2, EOL: '\n' });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        const modifiedFileName = file.originalname.replace(/\s+/g, '_');
        cb(null, modifiedFileName);
    }
});

const upload = multer({ storage: storage });

app.post('/uploadaudio', upload.single('audioFile'), async (req, res) => {
    const filePath = req.file.path;
    const notebookName = req.body.notebookName;

    const command = `python audio2text.py --path C:\\Users\\anirb\\OneDrive\\Desktop\\aspp\\asp-project\\backend\\${filePath} --folder ${notebookName}`;

    exec(command, async (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error executing Python script');
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);

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
            Name: req.file.originalname,
            Type: "Audio",
            Link: `http://localhost:${port}/${notebookName}/${req.file.originalname}`
        };

        await fs.writeJson(DATA_FILE, data, { spaces: 2, EOL: '\n' });

        res.send('File processed and data updated successfully');
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
