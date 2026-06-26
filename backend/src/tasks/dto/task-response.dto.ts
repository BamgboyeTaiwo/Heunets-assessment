import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../enums/task-status.enum';
import { TaskDocument } from '../schemas/task.schema';

export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority })
  priority: TaskPriority;

  @ApiProperty()
  project: string;

  @ApiProperty({ nullable: true })
  assignee: string | null;

  @ApiProperty({ nullable: true })
  dueDate: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(task: TaskDocument): TaskResponseDto {
    const dto = new TaskResponseDto();
    dto.id = task._id.toString();
    dto.title = task.title;
    dto.description = task.description;
    dto.status = task.status;
    dto.priority = task.priority;
    dto.project = task.project.toString();
    dto.assignee = task.assignee ? task.assignee.toString() : null;
    dto.dueDate = task.dueDate;
    dto.createdAt = (task as unknown as { createdAt: Date }).createdAt;
    dto.updatedAt = (task as unknown as { updatedAt: Date }).updatedAt;
    return dto;
  }
}
