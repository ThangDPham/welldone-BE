import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Req,
  UploadedFile,
  StreamableFile,
} from '@nestjs/common';

import { Request, Response} from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { CreateUserDto, UpdateUserDto } from './dto';
import { UserRoles } from 'src/users/enums';
import { Project } from 'src/projects/entities/project.entity';
import { UsersService } from 'src/users/users.service';
import { DocumentFile } from './entities';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Task } from 'src/tasks/entities';
import { TasksService } from 'src/tasks/tasks.service';
import { User } from 'src/users/entities';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(DocumentFile)
    private documentRepository: Repository<DocumentFile>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async create(@Req() req: Request, @UploadedFile() file, user_id: number): Promise<DocumentFile> {
    const documents = this.documentRepository.create();
    const task = await this.taskRepository.findOne({where:{id: parseInt(req.body.task_id, 10)}});
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    documents.task = task;
    documents.task_id = task.id;
    const user = await this.userRepository.findOne({where:{id : user_id}});
    documents.user = user;
    documents.user_id = user.id;

    documents.originalname = file.originalname;
    documents.mimetype = file.mimetype;
    documents.destination = file.destination;
    documents.filename = file.filename;
    documents.size = file.size;

    return await this.documentRepository.save(documents);
  }
  async download(id: number): Promise<StreamableFile> {
    const documents = await this.documentRepository.findOne({
      where:{ id },
    });
    if (!documents) {
      throw new NotFoundException('Document not found');
    }
    const filename = `\"${documents.originalname}\"`;
    const fileType = `${documents.mimetype}`;
    const file = createReadStream(
            join('./uploads', `${documents.filename}`),
            );
    return new StreamableFile(file,{
            type: `${fileType}`,
            disposition: `attachment; filename=${filename}`,
        });
  }
}
