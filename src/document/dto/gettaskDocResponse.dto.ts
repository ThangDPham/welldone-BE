import { Task } from 'src/tasks/entities';
import { User } from 'src/users/entities';

export class GetTaskDocumentResponse {
  id: number;
  user: User;
  filename: string;
  createAt: Date;
  constructor(id: number, user: User, filename: string, createAt: Date) {
    this.id = id;
    this.user = user;
    this.filename = filename;
    this.createAt = createAt;
  }
}
