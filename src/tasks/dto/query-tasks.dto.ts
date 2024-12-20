import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { TaskPriority, TaskStatus } from '../enums';

export class QueryTasksDto {
  @ApiProperty({
    description: 'Filter by status',
    enum: TaskStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'Filter by priority',
    enum: TaskPriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Search by title or description',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
