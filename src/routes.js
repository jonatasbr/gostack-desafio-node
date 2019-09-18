import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';

import authMiddleware from './app/middleware/auth';

const routes = new Router();
const upload = multer(multerConfig);

/**
 * rotas não autenticadas
 */
routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);

/**
 * middleware de autenticação
 * rotas autenticadas
 */
routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/meetups', MeetupController.store);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
