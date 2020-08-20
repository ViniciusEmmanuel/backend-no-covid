import {
  createConnection as CreateConnection,
  getConnectionOptions,
} from 'typeorm';

export class ORM {
  constructor(private createConnection = CreateConnection) {}

  public async execute(): Promise<void> {
    await this.TypeORM();
  }

  private async TypeORM() {
    const defaultOptions = await getConnectionOptions();

    return this.createConnection(defaultOptions);
  }
}
