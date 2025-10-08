import { IsString, IsEmail } from 'class-validator';

export class ResgisterDto {
     @IsString()
      username: string;
      @IsEmail()
      email: string;
      @IsString()
      password: string;
 
}

export class LoginDto {
      @IsEmail()
      email: string;

      @IsString()
      password: string;
}