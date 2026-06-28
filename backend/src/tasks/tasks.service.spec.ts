import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProjectsService } from '../projects/projects.service';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  const userId = new Types.ObjectId().toString();
  const memberId = new Types.ObjectId().toString();
  const outsiderId = new Types.ObjectId().toString();
  const projectId = new Types.ObjectId().toString();

  let taskModel: any;
  let projectsService: jest.Mocked<Pick<ProjectsService, 'findOneForUser'>>;
  let service: TasksService;
  let fakeProject: any;
  let savedTask: any;

  beforeEach(() => {
    fakeProject = {
      _id: new Types.ObjectId(projectId),
      members: [new Types.ObjectId(userId), new Types.ObjectId(memberId)],
    };

    savedTask = {
      _id: new Types.ObjectId(),
      title: 'Original title',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: null,
      dueDate: null,
      save: jest.fn().mockImplementation(function (this: any) {
        return Promise.resolve(this);
      }),
      deleteOne: jest.fn().mockResolvedValue(undefined),
    };

    taskModel = jest.fn().mockImplementation((data) => ({ ...data, save: savedTask.save })) as any;
    taskModel.findOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(savedTask) });

    projectsService = { findOneForUser: jest.fn().mockResolvedValue(fakeProject) };

    service = new TasksService(taskModel, projectsService as unknown as ProjectsService);
  });

  describe('create', () => {
    it('creates a task with no assignee', async () => {
      const task = await service.create(projectId, userId, { title: 'New task' } as any);

      expect(task.title).toBe('New task');
      expect(task.assignee).toBeNull();
    });

    it('creates a task assigned to a project member', async () => {
      const task = await service.create(projectId, userId, {
        title: 'New task',
        assignee: memberId,
      } as any);

      expect(task.assignee?.toString()).toBe(memberId);
    });

    it('rejects assigning a task to a user who is not a project member', async () => {
      await expect(
        service.create(projectId, userId, { title: 'New task', assignee: outsiderId } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('update', () => {
    it('updates the task status', async () => {
      const updated = await service.update(projectId, savedTask._id.toString(), userId, {
        status: 'done',
      } as any);

      expect(updated.status).toBe('done');
    });

    it('allows reassigning to another project member', async () => {
      const updated = await service.update(projectId, savedTask._id.toString(), userId, {
        assignee: memberId,
      } as any);

      expect(updated.assignee?.toString()).toBe(memberId);
    });

    it('rejects reassigning to a user who is not a project member', async () => {
      await expect(
        service.update(projectId, savedTask._id.toString(), userId, {
          assignee: outsiderId,
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('clears the assignee when given an empty string', async () => {
      savedTask.assignee = new Types.ObjectId(memberId);

      const updated = await service.update(projectId, savedTask._id.toString(), userId, {
        assignee: '',
      } as any);

      expect(updated.assignee).toBeNull();
    });

    it('throws NotFoundException for a task that does not exist in the project', async () => {
      taskModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      await expect(
        service.update(projectId, new Types.ObjectId().toString(), userId, {
          status: 'done',
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the task', async () => {
      await service.remove(projectId, savedTask._id.toString(), userId);

      expect(savedTask.deleteOne).toHaveBeenCalled();
    });
  });
});
