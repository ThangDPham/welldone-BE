import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProjectStatus } from '../enums/project-status.enum';
import { Group } from '../../group/entities/group.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { GroupInProjectDto } from '../dto/group-in-project.dto';
import { Task } from '../../tasks/entities/task.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('projects')
export class Project {
  @ApiProperty({
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'My First Project',
  })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({
    example: 'This is my first project',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: '2022-01-01',
  })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiProperty({
    example: '2022-12-31',
  })
  @Column({ type: 'timestamp' })
  endDate: Date;

  @ApiProperty({
    example: 'NOT_STARTED',
  })
  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.NOT_STARTED,
  })
  status: ProjectStatus;

  @ApiProperty({
    example: '2022-01-01T12:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2022-01-01T12:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    type: Group,
    isArray: true,
  })
  @OneToMany(() => Group, (group) => group.project)
  groups: Group[];

  members?: UserResponseDto[];

  userGroups?: GroupInProjectDto[];

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];
}
