import { Router } from "express";
import { fileRouter } from "./fileRouter.js";
const folderRouter = Router();

const folderController = await import(
  "../controllers/folderController.js"
);

import { ensureAuthenticated } from "../middleware/authMiddleware.js";

folderRouter.use(ensureAuthenticated);
folderRouter.use("/:folderId/files", fileRouter);

// specific routes first
folderRouter.get('/add_folder', folderController.addFolderForm);
folderRouter.post('/add_folder', folderController.createFolder);

// dynamic routes after
folderRouter.get('/:folderId', folderController.getFolder);
folderRouter.post('/:folderId/delete', folderController.deleteFolder);
folderRouter.post('/:folderId/edit', folderController.editFolderName);

export { folderRouter };