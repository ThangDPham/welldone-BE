import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddGroupDto {
  @ApiProperty({
    description: 'ID of the group to add to the project',
    example: 1,
    required: true,
  })
  @IsNumber()
  groupId: number;
}
