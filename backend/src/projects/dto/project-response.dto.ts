import { ApiProperty } from '@nestjs/swagger';
import { ProjectDocument } from '../schemas/project.schema';

export class ProjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  owner: string;

  @ApiProperty({ type: [String] })
  members: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(project: ProjectDocument): ProjectResponseDto {
    const dto = new ProjectResponseDto();
    dto.id = project._id.toString();
    dto.name = project.name;
    dto.description = project.description;
    dto.owner = project.owner.toString();
    dto.members = project.members.map((member) => member.toString());
    dto.createdAt = (project as unknown as { createdAt: Date }).createdAt;
    dto.updatedAt = (project as unknown as { updatedAt: Date }).updatedAt;
    return dto;
  }
}
