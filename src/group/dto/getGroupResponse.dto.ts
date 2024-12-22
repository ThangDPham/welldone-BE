import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto, GetUserJoinedResponse } from 'src/group/dto';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetGroupResponse extends PartialType(CreateGroupDto) {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  @IsArray()
  user: GetUserJoinedResponse[];

  @IsNumber()
  @IsOptional()
  projectId?: number;

  @IsString()
  @IsOptional()
  projectName?: string;
}
