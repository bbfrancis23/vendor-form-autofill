import { IsNotEmpty, IsString } from 'class-validator';

export class ExtractRequestDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
