import { UserStatus } from '../enums/user-status.enum';

export class CreateUserDto {
  name: string;

  email: string;

  password: string;

  isActive?: boolean;

  emailVerificationToken?: string;

  isEmailVerified?: boolean;

  status?: UserStatus;
}
