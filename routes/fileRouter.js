import { Router } from "express";
const fileRouter = Router({ mergeParams: true });
const fileController = await import("../controllers/fileController.js");
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

fileRouter.use(ensureAuthenticated);


fileRouter.get('/addFile', fileController.addFileForm);
fileRouter.post('/addFile', fileController.addFile);
fileRouter.get('/:id', fileController.getFile);

export { fileRouter };

