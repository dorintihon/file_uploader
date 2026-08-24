import { getFolderById } from '../db/queries.js';

async function addFileForm(req, res) {
    const folderId = parseInt(req.params.folderId, 10);
    const userId = req.user.id;
    const folder = await getFolderById(folderId, userId);

    if (!folder) {
        return res.status(404).send("Folder not found");
    }
    res.render("forms/addFile", { folder });
}

async function addFile(req, res) {
    const { name, folderId } = req.body;
    const userId = req.user.id;

    try {
        await createFile(name, folderId, userId);
        console.log(`File ${name} added successfully.`);
        res.redirect(`/folders/${folderId}`);
    } catch (error) {
        console.error("Error adding file:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function getFile(req, res) {
    const fileId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    try {
        const file = await getFileById(fileId, userId);
        if (!file) {
            return res.status(404).send("File not found");
        }
        res.render("forms/file", { file });
    } catch (error) {
        console.error("Error retrieving file:", error);
        res.status(500).send("Internal Server Error");
    }
}

export { addFileForm, addFile, getFile };