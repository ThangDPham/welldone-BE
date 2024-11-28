import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
  })
  id: number;

  @ApiProperty({
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
  })
  name: string;

  @ApiProperty({
    description: 'Email verification status',
  })
  isEmailVerified: boolean;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
  })
  access_token: string;

  @ApiProperty({
    description: 'Token expiration timestamp',
    example: '2024-12-27T16:25:47Z',
  })
  expires_at: string;

  @ApiProperty({
    description: 'User information',
    type: () => UserResponseDto,
  })
  user: UserResponseDto;
}

export class LoginUnverifiedResponseDto {
  @ApiProperty({
    description: 'Indicates that email verification is required',
  })
  requiresVerification: boolean;
}

export class SignupResponseDto {
  @ApiProperty({
    description: 'Whether verification code was sent successfully',
  })
  verificationEmailSent: boolean;
}
