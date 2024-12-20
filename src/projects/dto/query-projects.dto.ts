import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProjectsDto {
  @ApiProperty({
    description: 'Search by name or description',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by group ID',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  groupId?: number;
}
