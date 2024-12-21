import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { GroupsService } from './group.service';
// import { GroupsController } from './group.controller';
// import { Group, JoinGroup } from './entities';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities';
import { Project } from 'src/projects/entities';
import { DocumentsController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentFile } from './entities';
@Module({
  imports: [TypeOrmModule.forFeature([DocumentFile])],
  controllers: [DocumentsController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
