import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDate,
  IsEnum,
  IsNumber,
  MinLength,
  MaxLength,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus } from '../enums/project-status.enum';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Project description',
    required: false,
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Project start date',
  })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'Project end date',
  })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    default: ProjectStatus.NOT_STARTED,
  })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @ApiProperty({
    description: 'Array of group IDs to associate with the project',
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  groupIds: number[];
}
