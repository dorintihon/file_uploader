import { Router } from "express";
const indexRouter = Router();
const indexController = await import("../controllers/indexController.js");
const authController = await import("../controllers/authController.js");
const uploadController = await import("../controllers/uploadController.js");

indexRouter.get('/', indexController.getHomePage);


indexRouter.get('/register', authController.getRegister);
indexRouter.post('/login', authController.postLogin);
indexRouter.post('/register', authController.postRegister);
indexRouter.post('/logout', authController.postLogout);

indexRouter.post('/upload', uploadController.postUpload);

export { indexRouter };