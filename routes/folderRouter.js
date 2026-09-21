import { Router } from "express";
const folderRouter = Router();

const folderController = await import(
  "../controllers/folderController.js"
);

import { ensureAuthenticated } from "../middleware/authMiddleware.js";

folderRouter.use(ensureAuthenticated);

// specific routes first
folderRouter.get('/add_folder', folderController.addFolderForm);
folderRouter.post('/add_folder', folderController.createFolder);

// dynamic routes after
folderRouter.get('/:id', folderController.getFolder);
folderRouter.post('/:id/delete', folderController.deleteFolder);
folderRouter.post('/:id/edit', folderController.editFolderName);

export { folderRouter };