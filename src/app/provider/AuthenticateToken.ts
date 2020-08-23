import jwt from 'jsonwebtoken';

interface Ising {
  payload: {};
  id: string;
}

interface Iverify {
  token: string;
}

interface Itoken {
  iat: number;
  exp: number;
  sub: string;
}

export class AuthenticateToken {
  private readonly hashEncode =
    '$2a$08$U3yWNaNkFbJVU.JYsmayW.p51q/CzzwGloejK4//cJstzQxQosSZW';

  constructor(private provider = jwt) {}

  public sing({ payload = {}, id }: Ising) {
    return this.provider.sign(payload, this.hashEncode, {
      algorithm: 'HS256',
      subject: id,
      expiresIn: '3d',
    });
  }

  public verify({ token }: Iverify) {
    try {
      const { sub } = this.provider.verify(token, this.hashEncode) as Itoken;

      return { id: sub };
    } catch {
      throw new Error('Invalid token');
    }
  }
}
