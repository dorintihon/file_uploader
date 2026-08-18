import { Router } from "express";
const folderRouter = Router();
const folderController = await import("../controllers/folderController.js");
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

folderRouter.use(ensureAuthenticated);

folderRouter.get('/:id', folderController.getFolder);

export { folderRouter };
