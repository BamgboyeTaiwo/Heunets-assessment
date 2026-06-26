import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  const ownerId = new Types.ObjectId().toString();
  const outsiderId = new Types.ObjectId().toString();

  let projectModel: any;
  let taskModel: any;
  let usersService: jest.Mocked<Pick<UsersService, 'findByEmail'>>;
  let service: ProjectsService;
  let savedProject: any;

  beforeEach(() => {
    savedProject = {
      _id: new Types.ObjectId(),
      name: 'Original name',
      description: '',
      owner: new Types.ObjectId(ownerId),
      members: [new Types.ObjectId(ownerId)],
      save: jest.fn().mockImplementation(function (this: any) {
        return Promise.resolve(this);
      }),
      deleteOne: jest.fn().mockResolvedValue(undefined),
    };

    projectModel = {
      findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(savedProject) }),
    };
    taskModel = {
      deleteMany: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(undefined) }),
    };
    usersService = { findByEmail: jest.fn() };

    service = new ProjectsService(projectModel, taskModel, usersService as unknown as UsersService);
  });

  it('allows the owner to update the project', async () => {
    const updated = await service.update(savedProject._id.toString(), ownerId, {
      name: 'New name',
    });

    expect(updated.name).toBe('New name');
  });

  it('forbids a non-member from updating the project', async () => {
    await expect(
      service.update(savedProject._id.toString(), outsiderId, { name: 'Hijacked' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('forbids a non-owner member from deleting the project', async () => {
    savedProject.members.push(new Types.ObjectId(outsiderId));

    await expect(service.remove(savedProject._id.toString(), outsiderId)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('cascades task deletion when the owner deletes the project', async () => {
    await service.remove(savedProject._id.toString(), ownerId);

    expect(taskModel.deleteMany).toHaveBeenCalledWith({ project: savedProject._id });
    expect(savedProject.deleteOne).toHaveBeenCalled();
  });

  it('throws NotFoundException for a project that does not exist', async () => {
    projectModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await expect(
      service.findOneForUser(new Types.ObjectId().toString(), ownerId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
