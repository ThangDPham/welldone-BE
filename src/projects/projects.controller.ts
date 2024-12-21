import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, QueryProjectsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new project and associate it with existing groups',
  })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid group IDs or no groups specified',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user) {
    return this.projectsService.create(createProjectDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accessible projects' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of accessible projects',
  })
  findAll(@Query() query: QueryProjectsDto, @CurrentUser() user) {
    return this.projectsService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by id' })
  @ApiResponse({ status: 200, description: 'Returns the project details' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.projectsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user,
  ) {
    // Permission check is now handled in the service
    return this.projectsService.update(id, updateProjectDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    // Permission check is now handled in the service
    return this.projectsService.remove(id, user.id);
  }

  @Post(':id/groups')
  @ApiOperation({ summary: 'Add a group to project' })
  @ApiResponse({
    status: 201,
    description: 'Group added to project successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async addGroup(
    @Param('id', ParseIntPipe) projectId: number,
    @Body('groupId', ParseIntPipe) groupId: number,
    @CurrentUser() user,
  ) {
    return this.projectsService.addGroup(projectId, groupId, user.id);
  }

  @Delete(':id/groups/:groupId')
  @ApiOperation({ summary: 'Remove a group from project' })
  @ApiResponse({
    status: 200,
    description: 'Group removed from project successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async removeGroup(
    @Param('id', ParseIntPipe) projectId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
    @CurrentUser() user,
  ) {
    return this.projectsService.removeGroup(projectId, groupId, user.id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get all project members with their roles' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of project members with their roles',
    isArray: true,
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProjectMembers(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user,
  ): Promise<UserResponseDto[]> {
    return this.projectsService.getProjectMembers(id, user.id);
  }

  @Get(':id/groups')
  @ApiOperation({ summary: 'Get all project groups' })
  @ApiResponse({ status: 200, description: 'Returns list of project groups' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProjectGroups(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user,
  ) {
    return this.projectsService.getProjectGroups(id, user.id);
  }
}
