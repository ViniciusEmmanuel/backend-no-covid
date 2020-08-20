import path from 'path';
import fs from 'fs';

import { getRepository } from 'typeorm';
import { User } from '../models/User';
import { destination } from '../middleware/uploadFiles';
import { AppError } from '../exceptions/AppErros';

interface IUpdateAvatarUser {
  userId: string;
  avatarFileName: string;
}

export class UpdateAvatarUserService {
  constructor(private userRepository = getRepository(User)) {}

  public async execute({
    userId,
    avatarFileName,
  }: IUpdateAvatarUser): Promise<void> {
    const user = await this.userRepository.findOne(userId);

    if (!user) {
      await this.removeFileUser(destination, avatarFileName);

      throw new AppError('Only authenticated users can change avatar');
    }

    if (user.avatar) {
      await this.removeFileUser(destination, user.avatar);
    }

    user.avatar = avatarFileName;

    await this.userRepository.save(user);
  }

  private async removeFileUser(destination: string, fileName: string) {
    const userAvatarFilePath = path.join(destination, fileName);
    const userAvatarFileExists = await fs.promises.stat(userAvatarFilePath);

    if (userAvatarFileExists) {
      await fs.promises.unlink(userAvatarFilePath);
    }
  }
}
