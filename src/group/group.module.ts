import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsService } from './group.service';
import { GroupsController } from './group.controller';
import { Group, JoinGroup } from './entities';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities';
import { Project } from 'src/projects/entities';
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Group]),
    TypeOrmModule.forFeature([JoinGroup]),
    TypeOrmModule.forFeature([Project]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
