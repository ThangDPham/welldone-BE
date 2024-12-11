import { UserStatus } from '../enums/user-status.enum';

export class CreateUserDto {
  name: string;

  email: string;

  dateofbirth?: Date;

  password: string;

  group_id?: number;

  joined_at?: Date;

  isActive?: boolean;

  isEmailVerified?: boolean;

  verificationCode?: string;

  verificationCodeExpiresAt?: Date;

  passwordResetCode?: string;

  passwordResetCodeExpiresAt?: Date;

  status?: UserStatus;
}
