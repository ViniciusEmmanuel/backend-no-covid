import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { Hash } from '../provider/Hash';
import { AuthenticateToken } from '../provider/AuthenticateToken';
import { AppError } from '../exceptions/AppErros';

interface CreateAuthenticate {
  email: string;
  password: string;
}

interface ResponseAuth {
  id: string;
  token: string;
}

export class AuthenticateService {
  constructor(private userRepository = getRepository(User)) {}

  public async execute({
    email,
    password,
  }: CreateAuthenticate): Promise<ResponseAuth> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new AppError('Incorrect email or password.', 401);
    }

    const comparePassword = await new Hash().compare(password, user.password);

    if (!comparePassword) {
      throw new AppError('Incorrect email or password.', 401);
    }

    const token = new AuthenticateToken().sing({
      payload: { id: user.id },
      id: user.id,
    });

    return { id: user.id, token };
  }
}
