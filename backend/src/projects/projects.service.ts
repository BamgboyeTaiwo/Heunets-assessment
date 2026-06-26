import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';
import { UsersService } from '../users/users.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreateProjectDto): Promise<ProjectDocument> {
    const project = new this.projectModel({
      name: dto.name,
      description: dto.description ?? '',
      owner: new Types.ObjectId(userId),
      members: [new Types.ObjectId(userId)],
    });
    return project.save();
  }

  async findAllForUser(userId: string): Promise<ProjectDocument[]> {
    const id = new Types.ObjectId(userId);
    return this.projectModel.find({ members: id }).sort({ createdAt: -1 }).exec();
  }

  /** Fetches a project and asserts the user is a member, throwing 404/403 otherwise. */
  async findOneForUser(projectId: string, userId: string): Promise<ProjectDocument> {
    const project = await this.findByIdOrThrow(projectId);
    this.assertIsMember(project, userId);
    return project;
  }

  async update(projectId: string, userId: string, dto: UpdateProjectDto): Promise<ProjectDocument> {
    const project = await this.findByIdOrThrow(projectId);
    this.assertIsOwner(project, userId);

    if (dto.name !== undefined) project.name = dto.name;
    if (dto.description !== undefined) project.description = dto.description;

    return project.save();
  }

  async remove(projectId: string, userId: string): Promise<void> {
    const project = await this.findByIdOrThrow(projectId);
    this.assertIsOwner(project, userId);

    await this.taskModel.deleteMany({ project: project._id }).exec();
    await project.deleteOne();
  }

  async addMember(projectId: string, userId: string, dto: AddMemberDto): Promise<ProjectDocument> {
    const project = await this.findByIdOrThrow(projectId);
    this.assertIsOwner(project, userId);

    const member = await this.usersService.findByEmail(dto.email);
    if (!member) {
      throw new NotFoundException(`No user found with email ${dto.email}`);
    }

    const alreadyMember = project.members.some((memberId) => memberId.equals(member._id));
    if (!alreadyMember) {
      project.members.push(member._id);
      await project.save();
    }

    return project;
  }

  private async findByIdOrThrow(projectId: string): Promise<ProjectDocument> {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundException('Project not found');
    }
    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  private assertIsMember(project: ProjectDocument, userId: string): void {
    const isMember = project.members.some((memberId) => memberId.toString() === userId);
    if (!isMember) {
      throw new ForbiddenException('You do not have access to this project');
    }
  }

  private assertIsOwner(project: ProjectDocument, userId: string): void {
    if (project.owner.toString() !== userId) {
      throw new ForbiddenException('Only the project owner can perform this action');
    }
  }
}
