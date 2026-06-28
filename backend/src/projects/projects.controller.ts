import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project owned by the current user' })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProjectDto) {
    const project = await this.projectsService.create(user.userId, dto);
    return ProjectResponseDto.fromEntity(project);
  }

  @Get()
  @ApiOperation({ summary: 'List projects the current user owns or is a member of' })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const projects = await this.projectsService.findAllForUser(user.userId);
    return projects.map(ProjectResponseDto.fromEntity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single project' })
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const project = await this.projectsService.findOneForUser(id, user.userId);
    return ProjectResponseDto.fromEntity(project);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project (owner only)' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const project = await this.projectsService.update(id, user.userId, dto);
    return ProjectResponseDto.fromEntity(project);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project and all of its tasks (owner only)' })
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    await this.projectsService.remove(id, user.userId);
    return { id };
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a teammate to the project by email (owner only)' })
  async addMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
  ) {
    const project = await this.projectsService.addMember(id, user.userId, dto);
    return ProjectResponseDto.fromEntity(project);
  }

  @Get(':id/members')
  @ApiOperation({ summary: "Get the project's members, for populating an assignee picker" })
  async getMembers(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const members = await this.projectsService.getMembers(id, user.userId);
    return members.map(UserResponseDto.fromEntity);
  }
}
