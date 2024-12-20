import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role.enum';

export type GroupMember = Omit<User, 'role'> & {
  role: UserRoles;
};
