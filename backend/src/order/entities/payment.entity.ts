import { nanoid } from "nanoid";
import { BeforeInsert, Entity, OneToOne, PrimaryColumn, Column, } from "typeorm";
import { Order } from "./order.entity";


@Entity("payment")
export class Payment{
    @PrimaryColumn()
    id: string;

    @Column()
    status: string;
    
    @BeforeInsert()
              generateID(){
              this.id = `payment_${nanoid()}`;
            }
}