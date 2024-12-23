import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryFilesDto {
  @ApiProperty({
    description: 'Id of the task',
    required: true,
  })
  @Type(() => Number)
  @IsNumber()
  task_id: number;
}
