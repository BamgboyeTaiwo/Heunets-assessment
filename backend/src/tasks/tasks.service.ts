import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument } from './schemas/task.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly projectsService: ProjectsService,
  ) {}

  async create(projectId: string, userId: string, dto: CreateTaskDto): Promise<TaskDocument> {
    // Throws 404/403 if the project doesn't exist or the user isn't a member.
    await this.projectsService.findOneForUser(projectId, userId);

    const task = new this.taskModel({
      title: dto.title,
      description: dto.description ?? '',
      status: dto.status,
      priority: dto.priority,
      project: new Types.ObjectId(projectId),
      assignee: dto.assignee ? new Types.ObjectId(dto.assignee) : null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    });
    return task.save();
  }

  async findAllForProject(projectId: string, userId: string): Promise<TaskDocument[]> {
    await this.projectsService.findOneForUser(projectId, userId);
    return this.taskModel
      .find({ project: new Types.ObjectId(projectId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOneForProject(
    projectId: string,
    taskId: string,
    userId: string,
  ): Promise<TaskDocument> {
    await this.projectsService.findOneForUser(projectId, userId);
    return this.findByIdInProjectOrThrow(projectId, taskId);
  }

  async update(
    projectId: string,
    taskId: string,
    userId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskDocument> {
    await this.projectsService.findOneForUser(projectId, userId);
    const task = await this.findByIdInProjectOrThrow(projectId, taskId);

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status !== undefined) task.status = dto.status;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.assignee !== undefined) {
      task.assignee = dto.assignee ? new Types.ObjectId(dto.assignee) : null;
    }
    if (dto.dueDate !== undefined) {
      task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    return task.save();
  }

  async remove(projectId: string, taskId: string, userId: string): Promise<void> {
    await this.projectsService.findOneForUser(projectId, userId);
    const task = await this.findByIdInProjectOrThrow(projectId, taskId);
    await task.deleteOne();
  }

  private async findByIdInProjectOrThrow(projectId: string, taskId: string): Promise<TaskDocument> {
    if (!Types.ObjectId.isValid(taskId)) {
      throw new NotFoundException('Task not found');
    }
    const task = await this.taskModel
      .findOne({ _id: taskId, project: new Types.ObjectId(projectId) })
      .exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }
}
