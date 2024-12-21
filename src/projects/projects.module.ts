import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { GroupsModule } from '../group/group.module';
import { Group, JoinGroup } from 'src/group/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, JoinGroup, Group]),
    GroupsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
