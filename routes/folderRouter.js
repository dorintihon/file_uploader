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
folderRouter.get('/:id', folderController.getFolder);
folderRouter.post('/:id/delete', folderController.deleteFolder);
folderRouter.post('/:id/edit', folderController.editFolderName);

export { folderRouter };