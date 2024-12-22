import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber } from 'class-validator';
import { TaskPriority, TaskStatus } from '../enums';
import { Type } from 'class-transformer';

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

  @ApiProperty({
    description: 'Filter by project ID',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  projectId?: number;
}
