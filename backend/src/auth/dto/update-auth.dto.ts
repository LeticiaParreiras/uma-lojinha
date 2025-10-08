import { PartialType } from '@nestjs/mapped-types';
import { ResgisterDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(ResgisterDto) {}
