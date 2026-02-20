import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsInt, IsString, ValidateNested } from "class-validator"

export class imageProductDto{
    @ApiProperty()
    @ValidateNested({ each: true })
    @Type(() => imageProductResponse)
    image: imageProductResponse[]
}
export class imageProductResponse{
    @ApiProperty()
    @IsString()
    id: string

    @ApiProperty()
    @IsInt()
    @Type(() => Number)
    position: number
}