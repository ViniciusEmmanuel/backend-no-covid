import { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';

import { UserController } from '../app/controller/UserController';
import { ensureAuthenticated } from '../app/middleware/ensureAuthenticated';
import { uploadFiles, contentParser } from '../app/middleware/uploadFiles';

const RouterUsers = (
  app: FastifyInstance<Server, IncomingMessage, ServerResponse>,
  opts: { prefix: string },
  next: (err?: Error) => void,
) => {
  app.post(
    '/users',
    {
      websocket: false,
      schema: {
        body: {
          name: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
    new UserController().store,
  );

  app.register(contentParser);

  app.patch(
    '/users/avatar',
    {
      preHandler: [ensureAuthenticated, uploadFiles.single('avatar')],
    },
    new UserController().edit,
  );

  next();
};

const RouterUsersVersion = '/v1';

export { RouterUsers, RouterUsersVersion };
