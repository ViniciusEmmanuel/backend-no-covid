import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnValueStoreOrder1598220496355
  implements MigrationInterface {
  private table = new TableColumn({
    name: 'value',
    type: 'varchar',
    isNullable: true,
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('store_orders', this.table);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('store_orders', this.table);
  }
}
