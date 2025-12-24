import { CartItem } from "../entities/items.entity";

export class ItemResponse{
    id: string;
    product:{
        id: string;
        name: string;
    }
    quantity: number;
    totalPrice: number;

static fromEntity(item: CartItem): ItemResponse {
    return {
      id: item.id,
      quantity: item.quantity,
      totalPrice: Number(item.totalPrice.toFixed(2)),
      product:{ 
        id: item.Product.id,
        name: item.Product.name,
        }
    };
  }
   static fromEntities(items: CartItem[]): ItemResponse[] {
    return items.map(item => this.fromEntity(item));
  }
}