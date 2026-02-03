import { ValidateNested } from "class-validator";
import { AddressDto } from "./address.dto";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {

    @ValidateNested()
    @Type(() => AddressDto)
    @ApiProperty()
    address: AddressDto;
}


