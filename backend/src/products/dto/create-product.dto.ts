import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({example: 'Camiseta Rosa'})
    @IsString()
    name: string;
    
    @IsString()
    @ApiProperty({example: 'Camisa de cor rosa'})
    description: string;
    
    @Min(1, { message: 'The quantity must be equal to or larger than 1.' })
    @IsInt({message: 'The quantity must be an integer'})
    @ApiProperty({example: 100})
    quantity: number;
    
    @Min(0.1)
    @IsNumber({ maxDecimalPlaces: 2 })
    @ApiProperty({example: 59.99, minimum: 0.1})
    price: number;


}
