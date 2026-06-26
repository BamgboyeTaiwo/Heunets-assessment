import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task within a project' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    const task = await this.tasksService.create(projectId, user.userId, dto);
    return TaskResponseDto.fromEntity(task);
  }

  @Get()
  @ApiOperation({ summary: 'List all tasks for a project' })
  async findAll(@CurrentUser() user: AuthenticatedUser, @Param('projectId') projectId: string) {
    const tasks = await this.tasksService.findAllForProject(projectId, user.userId);
    return tasks.map(TaskResponseDto.fromEntity);
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get a single task' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    const task = await this.tasksService.findOneForProject(projectId, taskId, user.userId);
    return TaskResponseDto.fromEntity(task);
  }

  @Patch(':taskId')
  @ApiOperation({ summary: 'Update a task' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.tasksService.update(projectId, taskId, user.userId, dto);
    return TaskResponseDto.fromEntity(task);
  }

  @Delete(':taskId')
  @ApiOperation({ summary: 'Delete a task' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ) {
    await this.tasksService.remove(projectId, taskId, user.userId);
    return { id: taskId };
  }
}
