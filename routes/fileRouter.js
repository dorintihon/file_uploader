import { Router } from "express";
const fileRouter = Router({ mergeParams: true });
const fileController = await import("../controllers/fileController.js");
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

fileRouter.use(ensureAuthenticated);


fileRouter.get('/addFile', fileController.addFileForm);
fileRouter.get('/:fileId', fileController.getFile);
fileRouter.post('/upload', fileController.postUpload);
fileRouter.post('/:fileId/delete', fileController.deleteFile);

export { fileRouter };

