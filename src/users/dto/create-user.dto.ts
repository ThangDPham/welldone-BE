import { UserStatus } from '../enums/user-status.enum';

export class CreateUserDto {
  name: string;

  email: string;

  password: string;

  isActive?: boolean;

  isEmailVerified?: boolean;

  verificationCode?: string;

  verificationCodeExpiresAt?: Date;

  passwordResetCode?: string;

  passwordResetCodeExpiresAt?: Date;

  status?: UserStatus;
}
