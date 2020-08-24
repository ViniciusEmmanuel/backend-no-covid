import { getRepository } from 'typeorm';
import { User } from '../../models/User';
import { Hash } from '../../provider/Hash';
import { AppError } from '../../exceptions/AppErros';
import { Store } from '../../models/Store';

interface CreateUser {
  name: string;
  email: string;
  password: string;
  type: number;
  whatsapp: string;
  DDD: string;
}

export class CreateUserService {
  constructor(
    private userRepository = getRepository(User),
    private storeRepository = getRepository(Store),
  ) {}

  public async execute({
    name,
    email,
    password,
    type,
    whatsapp,
    DDD,
  }: CreateUser): Promise<User | null> {
    if (Number(type) === 1) {
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

    if (type === 2) {
      const ddd = String(DDD).trim().replace(/[^\d]/g, '');
      const phone = String(whatsapp).trim().replace(/[^\d]/g, '');

      const numberWhasts = `+55${ddd}${phone}`;

      const store = this.storeRepository.create({
        name,
        whatsapp: numberWhasts,
        address: `Endereço do ${name}`,
      });

      await this.storeRepository.save(store);
    }

    return null;
  }
}
