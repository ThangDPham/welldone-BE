import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { GroupsService } from './group.service';
import { CreateGroupDto, UpdateGroupDto } from './dto';
import { CurrentUser } from 'src/auth/decorators';
import { Group } from './entities';
import { User } from 'src/users/entities';
import { getGroupbyUserIdRes } from './ApiExample/getGroupbyUserIdRes.example';
@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}
  @Post()
  @ApiOperation({ summary: 'Create a new group and associate it with existing users' })
  @ApiResponse({ status: 201, description: 'Group successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@CurrentUser() user, @Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a group by id'})
  @ApiResponse({ status: 200, description: 'Return the group', example: getGroupbyUserIdRes, isArray: true })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOnebyId(@Param('id') id: number) {
    return this.groupsService.findOnebyId(id);
  }

  @Get()
  @ApiOperation({ summary: 'get all groups that user belongs to' })
  @ApiResponse({ status: 200, description: 'Return the groups',example: getGroupbyUserIdRes })
  @ApiResponse({ status: 404, description: 'Groups not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAllByUserId(@CurrentUser() user) {
    return this.groupsService.findAllByUserId(user.id);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a Group' })
  @ApiResponse({ status: 200, description: 'Group successfully updated' })
  @ApiResponse({
    status: 404,
    description: 'Group not found or Not authorized to update this group',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateGroupDto,
    @CurrentUser() user,
  ) {
    return this.groupsService.update(+id, updateUserDto, user.id);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a group' })
  @ApiResponse({ status: 200, description: 'group successfully deleted' })
  @ApiResponse({ status: 404, description: 'group not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.groupsService.remove(+id, user.id);
  }

  @Delete(':groupId/members/:userId')
  @ApiOperation({ summary: 'Remove a member from group' })
  @ApiResponse({ status: 200, description: 'Member successfully removed' })
  @ApiResponse({ status: 403, description: 'Not authorized to remove members' })
  @ApiResponse({ status: 404, description: 'Member or group not found' })
  @ApiResponse({ status: 400, description: 'Cannot remove last leader' })
  async removeMember(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
    @CurrentUser() currentUser,
  ) {
    return this.groupsService.removeMember(+groupId, +userId, currentUser.id);
  }
}
