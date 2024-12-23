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
import * as fs from 'fs';

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

  async findAllbyTaskId(task_id: number): Promise<StreamableFile[]> {
    const documents = await this.documentRepository.find({where: {task_id}});
    if (!documents) {
      throw new NotFoundException('This task has no documents');
    }
    let result = [];
    for (const document of documents) {
      try {
      result.push(await this.download(document.id));}
      catch(error) {
        throw new BadRequestException('Error while downloading file');
      }
    }
    return result;
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
            join(process.cwd()+'/uploads', `${documents.filename}`),
            );
    let result = new StreamableFile(file,{
            type: `${fileType}`,
            disposition: `attachment; filename=${filename}`,
        });
    return result;
  }
  async deleteFile(fileId: number, user_id: number): Promise<void> {
    try {
      const fileDelete = await this.documentRepository.findOne({where: {id: fileId}})
      if (!fileDelete) {
        throw new NotFoundException('File not found');
      }
      if (fileDelete.user_id !== user_id) {
        throw new ForbiddenException('You do not have permission to edit this file');
      }
      await fs.promises.unlink(process.cwd()+'/uploads/'+fileDelete.filename);
      await this.documentRepository.delete(fileId);

    } catch (error) {
      throw new NotFoundException(error);;
    }
  }
}
