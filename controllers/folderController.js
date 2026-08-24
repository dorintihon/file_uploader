import { getFolderById, deleteFolderById } from '../db/queries.js';

async function getFolder(req, res) {
    const folderId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const folder = await getFolderById(folderId, userId);
    if (!folder) {
        return res.status(404).send("Folder not found");
    }
    res.render("forms/folder", { folder, files: folder.files });
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

export { getFolder, deleteFolder };
