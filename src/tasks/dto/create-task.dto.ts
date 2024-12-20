import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsDate,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority, TaskStatus } from '../enums';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Task description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Due date',
  })
  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @ApiProperty({
    description: 'Task priority',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Task status',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    description: 'Project ID',
  })
  @IsNumber()
  projectId: number;

  @ApiProperty({
    description: 'Assignee user IDs',
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  assigneeIds: number[];
}
