import { Task } from "src/tasks/entities";
import { User } from "src/users/entities";

export class GetTaskDocumentResponse {
    id: number;
    user: User;
    filename: string;
    constructor(id: number, user: User, filename: string) {
        this.id = id;
        this.user = user;
        this.filename = filename;
    }
}