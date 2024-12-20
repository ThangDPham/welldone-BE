import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'User password',
    example: 'tuan06022003@',
  })
  @IsString()
  @Length(8, 32)
  password: string;
  @ApiProperty({
    description: 'New password',
    minLength: 8,
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  newPassword: string;
}
