import { FastifyReply, FastifyRequest } from 'fastify';
import { CreateUserService } from '../service/CreateUserService';
import { UpdateAvatarUserService } from '../service/UpdateAvatarUserService';

interface IUserStore {
  name: string;
  email: string;
  password: string;
}

export class UserController {
  public async store(request: FastifyRequest, response: FastifyReply) {
    try {
      const { name, email, password } = request.body as IUserStore;

      const createUserService = new CreateUserService();

      const user = await createUserService.execute({ name, email, password });

      delete user.password;

      return response.status(201).send(user);
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
