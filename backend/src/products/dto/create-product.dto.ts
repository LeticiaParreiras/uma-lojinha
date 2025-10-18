import { IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsString()
    description: string;
    @IsNumber({ maxDecimalPlaces: 2 })

    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(0)

    quantity: number;

    @Min(0)
    price: number;


}
