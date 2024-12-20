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
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, QueryTasksDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { Task } from './entities/task.entity';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
    type: Task,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user) {
    return this.tasksService.create(createTaskDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({
    status: 200,
    description: 'Return all tasks the user has access to.',
    type: [Task],
  })
  findAll(@Query() query: QueryTasksDto, @CurrentUser() user) {
    return this.tasksService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the task.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.tasksService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully updated.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user,
  ) {
    return this.tasksService.update(id, updateTaskDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user) {
    return this.tasksService.remove(id, user.id);
  }

  @Post(':id/assignees/:assigneeId')
  @ApiOperation({ summary: 'Assign user to task' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully assigned to the task.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task or user not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  assignUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('assigneeId', ParseIntPipe) assigneeId: number,
    @CurrentUser() user,
  ) {
    return this.tasksService.assignUser(id, user.id, assigneeId);
  }

  @Delete(':id/assignees/:assigneeId')
  @ApiOperation({ summary: 'Unassign user from task' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully unassigned from the task.',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task or user not found' })
  unassignUser(
    @Param('id', ParseIntPipe) id: number,
    @Param('assigneeId', ParseIntPipe) assigneeId: number,
    @CurrentUser() user,
  ) {
    return this.tasksService.unassignUser(id, user.id, assigneeId);
  }
}
