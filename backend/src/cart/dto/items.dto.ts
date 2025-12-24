import { IsNumber, IsString, Min } from "class-validator";
export class ItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(0, { message: 'O valor deve ser positivo' })
  quantity: number;

}
