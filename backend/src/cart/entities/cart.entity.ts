import {
    BeforeInsert,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { CartItem } from './items.entity';


@Entity("cart")
export class Cart {
  @PrimaryColumn()
  id: string;

  @OneToOne(() => User, (user) => user.Cart)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => CartItem, (CartItem) => CartItem.Cart, {cascade: true} )
  CartItems: CartItem[];

  @BeforeInsert()
  generateID() {
    this.id = `cart_${this.user.id}`;
  }
}
