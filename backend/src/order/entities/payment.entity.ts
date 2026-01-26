import { nanoid } from "nanoid";
import { BeforeInsert, Entity, OneToOne, PrimaryColumn, Column, } from "typeorm";
import { Order } from "./order.entity";

export enum paymentStatus{
    pending = "pending",
    canceled = "canceled",
    confirm = "confirm"
}
@Entity("payment")
export class Payment{
    @PrimaryColumn()
    id: string;

    @Column({type: "varchar",default: paymentStatus.pending})
    status: paymentStatus;

    @Column()
    preferenceId: string

    @OneToOne(() => Order, (order) => order.payment)
    order: Order;

    
    @BeforeInsert()
              generateID(){
              this.id = `payment_${this.order.id}`;
            }
}