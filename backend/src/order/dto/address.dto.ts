import { IsNotEmpty, IsString, Length, Validate } from "class-validator";
import { IsCepValidConstraint } from "./IsCepValid";
import { ApiProperty } from "@nestjs/swagger";
export class cepApi{
      @Validate(IsCepValidConstraint)
      @ApiProperty({
            example: '01001000',
      })
      cep: string;
}
export class cepResponse{
      
        @IsString()
        @Length(2)
        uf: string;
      
        @IsString()
        @Length(3, 50)
        cidade: string;
      
        @IsString()
        bairro: string;
      
        @IsString()
        @Length(3, 100)
        logradouro: string;
    
        @IsString()
        @Length(1, 10)
        complemento: string;
}
export class AddressDto{
   @IsNotEmpty()
    @IsString()
    @Length(3, 100)
    @ApiProperty({
            example: 'User Name',
      })
    name: string;
    
    @IsNotEmpty()
    @Validate(IsCepValidConstraint)
    @ApiProperty({example: '01001000'})
    cep: string;
    
    @ApiProperty({example: 'SP'})
    @IsNotEmpty()
    @IsString()
    @Length(2)
    uf: string;

    @ApiProperty({example: 'São Paulo'})
    @IsNotEmpty()
    @IsString()
    @Length(3, 50)
    cidade: string;
    
    @IsNotEmpty()
    @IsString()
    @ApiProperty({example: 'Sé'})
    bairro: string;

    @IsNotEmpty()
    @IsString()
    @Length(3, 100)
    @ApiProperty({example: 'Praça da Sé'})
    logradouro: string;
    
    @IsString()
    @Length(0,100)
    @ApiProperty({example: 'lado ímpar'})
    complemento?: string;
    
    @IsNotEmpty()
    @IsString()
    @Length(1, 5)
    @ApiProperty({example: '43'})
    numero: string;
    }