import { Router } from "express";
const indexRouter = Router();
const indexController = await import("../controllers/indexController.js");
const authController = await import("../controllers/authController.js");

indexRouter.get('/', indexController.getHomePage);


indexRouter.get('/register', authController.getRegister);
indexRouter.post('/login', authController.postLogin);
indexRouter.post('/register', authController.postRegister);
indexRouter.post('/logout', authController.postLogout);

export { indexRouter };