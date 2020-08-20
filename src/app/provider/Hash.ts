//import bcryptjs from 'bcryptjs';
import argon2 from 'argon2';
export class Hash {
  // bcrypt private readonly salt = 8;
  private readonly options: argon2.Options & { raw: false } = {
    raw: false,
    saltLength: 8,
  };

  constructor(private provider = argon2) {}

  public async compare(str: string, hash: string) {
    // bcrypt return this.provider.compareSync(str, hash);
    return this.provider.verify(hash, str, this.options);
  }

  public async hash(str: string) {
    // bcrypt return this.provider.hash(str, this.salt);
    return this.provider.hash(str, this.options);
  }
}
