import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../enums/task-status.enum';

export class CreateTaskDto {
  @ApiProperty({ example: 'Set up CI pipeline' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ example: 'Configure GitHub Actions for lint, test, and build' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'User id of the assignee' })
  @IsOptional()
  @IsMongoId()
  assignee?: string;

  @ApiPropertyOptional({ example: '2026-07-01T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
