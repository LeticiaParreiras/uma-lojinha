import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResgisterDto {
      @ApiProperty({
            example: 'name'
      })
     @IsString()
      username: string;

      @ApiProperty({
            example: 'email@gmail.com'
      })
      @IsEmail()
      email: string;

      @ApiProperty({
            example: 'password'
      })
      @IsString()
      password: string;
 
}

export class LoginDto {
      @ApiProperty({
            example: 'email@gmail.com'
      })
      @IsEmail()
      email: string;
      @ApiProperty({
            example: 'password'
      })
      @IsString()
      password: string;
}