import { ApiProperty } from '@nestjs/swagger';
import { UserRoles } from '../enums/user-role.enum';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  dateofbirth?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ enum: UserRoles, required: false })
  role?: UserRoles;
}