import { IsInt, IsNumber, IsString, Min } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
export class ItemDto {
  @IsString()
  @ApiProperty({
            example: 'product_...'
      })
  productId: string;

  @IsNumber()
  @Min(1, { message: 'The quantity must be equal to or larger than 1.' })
  @IsInt({message: 'The quantity must be an integer'})
  @ApiProperty({
            example: '5',
            minimum: 1,
      })
  quantity: number;

}
