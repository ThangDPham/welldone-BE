import { PartialType } from "@nestjs/mapped-types";
import { CreateGroupDto, GetUserJoinedResponse } from "src/group/dto";

import { IsArray } from "class-validator";

export class GetGroupResponse extends PartialType(CreateGroupDto) {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  role: string
  @IsArray()
  user: GetUserJoinedResponse[];
}
