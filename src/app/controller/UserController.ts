import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserService } from '../service/User/CreateUserService';
import { UpdateAvatarUserService } from '../service/User/UpdateAvatarUserService';

import { AuthenticateToken } from '../provider/AuthenticateToken';

interface IUserStore {
  name: string;
  email: string;
  password: string;
  type: number;
  whatsapp: string;
  DDD: string;
}

export class UserController {
  public async store(request: FastifyRequest, response: FastifyReply) {
    try {
      const {
        name,
        email,
        password,
        type,
        whatsapp,
        DDD,
      } = request.body as IUserStore;

      const createUserService = new CreateUserService();

      const user = await createUserService.execute({
        name,
        email,
        password,
        type,
        whatsapp,
        DDD,
      });

      if (user) {
        delete user.password;

        const token = new AuthenticateToken().sing({
          payload: { id: user.id },
          id: user.id,
        });

        return response.status(201).send({ token, ...user });
      }

      return response.status(204).send({});
    } catch (error) {
      return response.status(400).send({ message: error.message });
    }
  }

  public async edit(request: FastifyRequest, response: FastifyReply) {
    const { file = null } = request;

    if (!file) {
      return response.status(400).send({ message: 'File not found.' });
    }

    const updateUserAvatarService = new UpdateAvatarUserService();

    await updateUserAvatarService.execute({
      userId: request.user.id,
      avatarFileName: request.file.filename,
    });

    return response.status(204).send();
  }
}
