import { IsNotEmpty, IsString, Length, Validate } from "class-validator";
import { IsCepValidConstraint } from "./IsCepValid";
export class cepApi{
      @Validate(IsCepValidConstraint)
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
    name: string;
      @IsNotEmpty()
    @Validate(IsCepValidConstraint)
    cep: string;
    @IsNotEmpty()
    @IsString()
    @Length(2)
    uf: string;
    @IsNotEmpty()
    @IsString()
    @Length(3, 50)
    cidade: string;
    @IsNotEmpty()
    @IsString()
    bairro: string;
    @IsNotEmpty()
    @IsString()
    @Length(3, 100)
    logradouro: string;

    @IsString()
    @Length(0,100)
    complemento?: string;

@IsNotEmpty()
    @IsString()
    @Length(1, 5)
    numero: string;
    }