import { getFolderById, deleteFolderById, createFolderInDB, editFolderNameInDB } from '../db/queries.js';

async function getFolder(req, res) {
    const folderId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const folder = await getFolderById(folderId, userId);
    if (!folder) {
        return res.status(404).send("Folder not found");
    }
    res.render("forms/folder", { folder, files: folder.files });
}

async function createFolder(req, res) {
    console.log("Creating folder with data:", req.body);
    const { name } = req.body;
    const userId = req.user.id;

    try {
        await createFolderInDB(name, userId);
        res.redirect("/");
    } catch (error) {
        console.error("Error creating folder:", error);
        res.status(500).send("Internal Server Error");
    }
}   

async function deleteFolder(req, res) {
    const folderId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    try {
        await deleteFolderById(folderId, userId);
        res.redirect("/");
    } catch (error) {
        console.error("Error deleting folder:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function editFolderName(req, res) {
    const folderId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { name } = req.body;

    try {
        await editFolderNameInDB(folderId, userId, name);
        res.redirect(`/folders/${folderId}`);
    } catch (error) {
        console.error("Error editing folder name:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function addFolderForm(req, res) {
    res.render("forms/addFolder");
}

export { getFolder, deleteFolder, createFolder, addFolderForm, editFolderName };
