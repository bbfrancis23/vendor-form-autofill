import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

const MAX_TEXT_LENGTH = 20000;

export class ExtractRequestDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'text must contain more than whitespace' })
  @MaxLength(MAX_TEXT_LENGTH)
  text: string;
}
