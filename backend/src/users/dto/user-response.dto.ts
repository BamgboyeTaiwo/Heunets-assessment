import { ApiProperty } from '@nestjs/swagger';
import { UserDocument } from '../schemas/user.schema';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  static fromEntity(user: UserDocument): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user._id.toString();
    dto.name = user.name;
    dto.email = user.email;
    return dto;
  }
}
