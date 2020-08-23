import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Store } from './Store';
import { Order } from './Order';

@Entity('store_orders')
export class StoreOrder {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  order_id: string;

  @Column()
  store_id: string;

  @Column()
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Order, { eager: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @OneToOne(() => Store, { eager: true })
  @JoinColumn({ name: 'store_id' })
  store: Store;
}
