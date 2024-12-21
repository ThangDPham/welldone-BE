import { User } from '../../users/entities/user.entity';
import { UserRoles } from '../../users/enums/user-role.enum';

export type ProjectMember = User & {
  role: UserRoles;
};