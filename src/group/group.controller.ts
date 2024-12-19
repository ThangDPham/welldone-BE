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
  import { GroupsService} from './group.service';
  import { CreateGroupDto, UpdateGroupDto } from './dto';
import { CurrentUser } from 'src/auth/decorators';
  @ApiTags('groups')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Controller('groups')
  export class GroupsController {
    constructor(private readonly groupsService: GroupsService) {}
    @Post()
    @ApiOperation({ summary: 'Create a new group' })
    @ApiResponse({ status: 201, description: 'Group successfully created' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@CurrentUser() user, @Body() createGroupDto: CreateGroupDto) {
        return this.groupsService.create(createGroupDto, user.id);
    }
    @Get(':name')  
    @ApiOperation({ summary: 'Get a group by name' })
    @ApiResponse({ status: 200, description: 'Return the group' })
    @ApiResponse({ status: 404, description: 'Group not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    findOne(@Param('name') name: string) {
        return this.groupsService.findbyName(name);
    }
    @Get()
    @ApiOperation({ summary:'get all groups that user belongs to' })
    @ApiResponse({ status: 200, description: 'Return the groups' })
    @ApiResponse({ status: 404, description: 'Groups not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    findAllByUserId(@CurrentUser() user) {
        return this.groupsService.findAllByUserId(user.id);
    }
    @Patch(':id')
    @ApiOperation({ summary: 'Update a Group' })
    @ApiResponse({ status: 200, description: 'Group successfully updated' })
    @ApiResponse({ status: 404, description: 'Group not found or Not authorized to update this group' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateGroupDto, @CurrentUser() user) {
        return this.groupsService.update(+id, updateUserDto, user.id);
    }
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a user' })
    @ApiResponse({ status: 200, description: 'User successfully deleted' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    remove(@Param('id') id: string, @CurrentUser() user) {
        return this.groupsService.remove(+id,user.id);
    }

  }
