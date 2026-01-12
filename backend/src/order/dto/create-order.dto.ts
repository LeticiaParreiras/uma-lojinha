import { IsNumber, IsString, Min, ValidateNested } from "class-validator";
import { AddressDto } from "./address.dto";
import { Type } from "class-transformer";

export class itemOrder{
      @IsString()
      productId: string;
    
      @IsNumber()
      @Min(0, { message: 'O valor deve ser positivo' })
      quantity: number;
    
}

export class CreateOrderDto {
    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;
}


