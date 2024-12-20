import { PartialType } from "@nestjs/mapped-types";
import { CreateGroupDto } from "src/group/dto";
import { User } from "../../users/entities";
import { IsArray } from "class-validator";

export class GetGroupResponse extends PartialType(CreateGroupDto) {
    id: number;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    @IsArray()
    user: User[];
}