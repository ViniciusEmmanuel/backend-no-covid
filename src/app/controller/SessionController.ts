import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthenticateService } from '../service/User/AuthenticateService';

interface ISessionStore {
  email: string;
  password: string;
}

export class SessionController {
  public async store(request: FastifyRequest, response: FastifyReply) {
    const { email, password } = request.body as ISessionStore;

    const authenticateService = new AuthenticateService();

    const { id, token } = await authenticateService.execute({
      email,
      password,
    });

    return response.status(201).send({ id, token });
  }
}
