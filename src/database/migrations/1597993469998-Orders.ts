import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class Orders1597993469998 implements MigrationInterface {
  private table = new Table({
    name: 'orders',
    columns: [
      {
        name: 'id',
        type: 'uuid',
        isPrimary: true,
        generationStrategy: 'uuid',
        default: 'uuid_generate_v4()',
      },
      {
        name: 'user_id',
        type: 'uuid',
      },
      {
        name: 'store_id',
        type: 'uuid',
        isNullable: true,
      },
      {
        name: 'itens',
        type: 'json',
      },
      {
        name: 'status',
        type: 'int',
      },
      {
        name: 'created_at',
        type: 'timestamp',
        default: 'now()',
      },
      {
        name: 'updated_at',
        type: 'timestamp',
        default: 'now()',
      },
    ],
  });

  private foreignKey = [
    new TableForeignKey({
      name: 'FK_orders_user_id',
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'users',
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    }),

    new TableForeignKey({
      name: 'FK_orders_store_id',
      columnNames: ['store_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'stores',
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table);
    await queryRunner.createForeignKeys('orders', this.foreignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys('orders', this.foreignKey);
    await queryRunner.dropTable(this.table);
  }
}
