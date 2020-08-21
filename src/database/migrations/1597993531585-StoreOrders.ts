import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class StoreOrders1597993531585 implements MigrationInterface {
  private table = new Table({
    name: 'store_orders',
    columns: [
      {
        name: 'id',
        type: 'uuid',
        isPrimary: true,
        generationStrategy: 'uuid',
        default: 'uuid_generate_v4()',
      },
      {
        name: 'order_id',
        type: 'uuid',
      },
      {
        name: 'store_id',
        type: 'uuid',
      },
      {
        name: 'message_twilio_sid',
        type: 'varchar',
        isUnique: true,
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
      name: 'FK_store_orders_order_id',
      columnNames: ['order_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'orders',
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    }),

    new TableForeignKey({
      name: 'FK_store_orders_store_id',
      columnNames: ['store_id'],
      referencedColumnNames: ['id'],
      referencedTableName: 'stores',
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table);
    await queryRunner.createForeignKeys('store_orders', this.foreignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys('store_orders', this.foreignKey);
    await queryRunner.dropTable(this.table);
  }
}
