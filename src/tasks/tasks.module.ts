import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { UsersModule } from '../users/users.module';
import { Group, JoinGroup } from 'src/group/entities';
import { Project } from 'src/projects/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Task, JoinGroup, Project, Group]), UsersModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
