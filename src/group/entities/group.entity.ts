import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Entity('group')
export class Group {
  @ApiProperty({
    example: '1',
  })
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Project 1',
  })
  @Expose()
  @Column({ nullable: true, length: 100 })
  name: string;

  @ApiProperty({
    example: '2022-01-01T00:00:00.000Z',
  })
  @Expose()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    example: 'Group 1 description',
  })
  @Expose()
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    example: '1',
  })
  @Expose()
  @Column({ nullable: true })
  user_id_create: number;

  @ApiProperty({
    type: Project,
  })
  @ManyToOne(() => Project, (project) => project.groups, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @ApiProperty({
    example: '1',
  })
  @Expose()
  @Column({ nullable: true })
  projectId: number;
}
