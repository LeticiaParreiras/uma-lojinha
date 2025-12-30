import { nanoid } from 'nanoid';
import { Cart } from 'src/cart/entities/cart.entity';
import { BeforeInsert, Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
@Entity("users")
export class User {
    @PrimaryColumn()
    id: string;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({
    type: 'varchar',
    default: UserRole.USER
  })
    role: UserRole;

    @OneToOne(() => Cart, (Cart) => Cart.user, {
      cascade: true
    })
    Cart : Cart;

    @BeforeInsert()
    generateID(){
    this.id = `user_${nanoid()}`;
  }
}
