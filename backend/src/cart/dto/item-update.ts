import { IsNumber, Min } from "class-validator";

export class itemUpdate{
    @IsNumber()
      @Min(0, { message: 'O valor deve ser positivo' })
      quantity: number;
}