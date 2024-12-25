import { UserResponseDto } from '../../users/dto';
import { User } from '../../users/entities';
import { UserRoles } from '../../users/enums';

export class GetUserJoinedResponse extends UserResponseDto {
  constructor(user: User, role: UserRoles) {
    super();
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.dateofbirth = user.dateofbirth;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.role = role;
  }
}
