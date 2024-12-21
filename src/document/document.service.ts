import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Req,
  UploadedFile,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { CreateUserDto, UpdateUserDto } from './dto';
import { UserRoles } from 'src/users/enums';
import { Project } from 'src/projects/entities/project.entity';
import { UsersService } from 'src/users/users.service';
import { DocumentFile } from './entities';


@Injectable()
export class DocumentService {
    constructor(
        @InjectRepository(DocumentFile)
            private documentRepository: Repository<DocumentFile>
    ) {}
    async create(
        @Req() req: any,
        @UploadedFile() file
    ): Promise<DocumentFile> {
        const documents = this.documentRepository.create();
        documents.name = file.originalname;
        documents.attachFile = file.buffer;
        return await this.documentRepository.save(documents);
    }
    async download(): Promise<DocumentFile> {
        const documents = await this.documentRepository.findBy({id: 4});
        return documents[0];

    }
}