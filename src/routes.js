import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import EventOwnerController from './app/controllers/EventOwnerController';
import SubscriptionController from './app/controllers/SubscriptionController';

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

routes.get('/meetups', MeetupController.index);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

routes.get('/events', EventOwnerController.index);

routes.post('/meetups/:meetupId/subscriptions', SubscriptionController.store);
routes.get('/subscriptions', SubscriptionController.index);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
