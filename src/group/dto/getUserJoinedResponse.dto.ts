import { PartialType } from "@nestjs/mapped-types";
import { User } from "src/users/entities";
import { CreateGroupDto } from "./createGroup.dto";

export class GetUserJoinedResponse {
    role: string;
    user: User;
    constructor(user: User, role: string) {
        this.user = user;
        this.role = role;
    }
}