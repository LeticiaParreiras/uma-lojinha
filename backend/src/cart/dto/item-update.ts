import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export class itemUpdate{
    @IsNumber()
      @Min(1, { message: 'The quantity must be equal to or larger than 1' })
      @ApiProperty({
                  example: '5',
                  minimum: 1,
            })
      quantity: number;
}