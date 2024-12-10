import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsStrongPassword,
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  IsDate,
  IsDateString,
} from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'User first name',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstname: string;

  @ApiProperty({
    description: 'User last name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastname: string;

  @ApiProperty({
    description: 'User Date of birth',
    example: '2003/02/27',
  })
  @Type(() => Date)
  @IsDate()
  dateofbirth: Date;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'User password - must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
    minLength: 8,
    maxLength: 32,
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
