import { getFolderById } from '../db/queries.js';

async function getFolder(req, res) {
    const folderId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const folder = await getFolderById(folderId, userId);
    if (!folder) {
        return res.status(404).send("Folder not found");
    }
    res.render("forms/folder", { folder, files: folder.files });
}

export { getFolder };
