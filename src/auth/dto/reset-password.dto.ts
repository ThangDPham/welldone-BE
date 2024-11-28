import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Reset code (6 digits)',
    example: '123456',
  })
  @IsString()
  @Length(6, 6)
  code: string;

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
