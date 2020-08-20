import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { Hash } from '../provider/Hash';
import { AppError } from '../exceptions/AppErros';

interface CreateUser {
  name: string;
  email: string;
  password: string;
}

export class CreateUserService {
  constructor(private userRepository = getRepository(User)) {}

  public async execute({ name, email, password }: CreateUser): Promise<User> {
    const checkExistEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (checkExistEmail) {
      throw new AppError('Email address already used.');
    }

    const hashedPassword = await new Hash().hash(password);

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return user;
  }
}
