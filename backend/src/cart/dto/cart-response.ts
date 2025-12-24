import { Type } from "class-transformer"
import { ItemResponse } from "./item-response"
import { Cart } from "../entities/cart.entity";

export class CartResponse{
    id: string;
    @Type(() => ItemResponse)
    cartItems: ItemResponse[];

    static fromEntity(cart: Cart): CartResponse {
    const cartItems = ItemResponse.fromEntities(cart.CartItems || []);
    return{
        id: cart.id,
        cartItems : cartItems,
    } 
}
}