import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto, UpdateTaskDto, QueryTasksDto } from './dto';
import { UsersService } from '../users/users.service';
import { Project } from '../projects/entities/project.entity';
import { In } from 'typeorm';
import { UserRoles } from '../users/enums/user-role.enum';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { JoinGroup, Group } from '../group/entities';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(JoinGroup)
    private joinGroupRepository: Repository<JoinGroup>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    private usersService: UsersService,
  ) {}

  private async validateUserInGroup(
    userId: number,
    groupId: number,
  ): Promise<void> {
    const membership = await this.joinGroupRepository.findOne({
      where: { user_id: userId, group_id: groupId },
    });
    if (!membership) {
      throw new ForbiddenException('User is not a member of this group');
    }
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignees', 'createdBy', 'project'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.validateUserProjectAccess(task.projectId, userId);

    const enrichedAssignees: UserResponseDto[] = [];
    for (const assignee of task.assignees) {
      const membership = await this.joinGroupRepository.findOne({
        where: { user_id: assignee.id },
      });
      const userResponse = await this.usersService.getUserWithRole(
        assignee.id,
        (membership?.role as UserRoles) || UserRoles.Member,
      );
      enrichedAssignees.push(userResponse);
    }
    task.assignees = enrichedAssignees;

    return task;
  }

  private async canModifyTask(
    taskId: number,
    userId: number,
  ): Promise<boolean> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['assignees'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (
      task.createdById === userId ||
      task.assignees.some((a) => a.id === userId)
    ) {
      return true;
    }

    const assigneeIds = task.assignees.map((a) => a.id);
    const leaderGroups = await this.joinGroupRepository.find({
      where: { user_id: userId, role: UserRoles.Leader },
    });

    for (const group of leaderGroups) {
      const groupMembers = await this.joinGroupRepository.find({
        where: { group_id: group.group_id },
      });
      if (groupMembers.some((m) => assigneeIds.includes(m.user_id))) {
        return true;
      }
    }

    return false;
  }

  async remove(id: number, userId: number): Promise<void> {
    if (!(await this.canModifyTask(id, userId))) {
      throw new ForbiddenException('Not authorized to delete this task');
    }

    const task = await this.findOne(id, userId);
    await this.taskRepository.remove(task);
  }

  private async enrichAssignees(
    assignees: UserResponseDto[],
  ): Promise<UserResponseDto[]> {
    const enrichedAssignees: UserResponseDto[] = [];
    for (const assignee of assignees) {
      const membership = await this.joinGroupRepository.findOne({
        where: { user_id: assignee.id },
      });
      const userResponse = await this.usersService.getUserWithRole(
        assignee.id,
        (membership?.role as UserRoles) || UserRoles.Member,
      );
      enrichedAssignees.push(userResponse);
    }
    return enrichedAssignees;
  }

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    await this.validateUserProjectAccess(createTaskDto.projectId, userId);

    const assignees = await this.usersService.findByIds(
      createTaskDto.assigneeIds,
    );

    for (const assignee of assignees) {
      await this.validateUserProjectAccess(
        createTaskDto.projectId,
        assignee.id,
      );
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      createdById: userId,
      assignees: assignees,
    });

    const savedTask = await this.taskRepository.save(task);
    savedTask.assignees = await this.enrichAssignees(assignees);

    return savedTask;
  }

  async findAll(query: QueryTasksDto, userId: number): Promise<Task[]> {
    const userGroups = await this.joinGroupRepository.find({
      where: { user_id: userId },
    });
    const userGroupIds = userGroups.map((g) => g.group_id);

    const groupMembers = await this.joinGroupRepository.find({
      where: { group_id: In(userGroupIds) },
    });
    const memberIds = [...new Set(groupMembers.map((m) => m.user_id))];

    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.project', 'project')
      .where('assignee.id IN (:...memberIds)', { memberIds })
      .andWhere(query.status ? 'task.status = :status' : '1=1', {
        status: query.status,
      })
      .andWhere(query.priority ? 'task.priority = :priority' : '1=1', {
        priority: query.priority,
      })
      .andWhere(
        query.search
          ? '(task.title ILIKE :search OR task.description ILIKE :search)'
          : '1=1',
        { search: query.search ? `%${query.search}%` : '' },
      )
      .getMany();

    for (const task of tasks) {
      task.assignees = await this.enrichAssignees(task.assignees);
    }

    return tasks;
  }

  async findByGroup(groupId: number, userId: number): Promise<Task[]> {
    await this.validateUserInGroup(userId, groupId);

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['project'],
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const groupMembers = await this.joinGroupRepository.find({
      where: { group_id: groupId },
    });
    const memberIds = groupMembers.map((m) => m.user_id);

    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.project', 'project')
      .where('assignee.id IN (:...memberIds)', { memberIds })
      .andWhere('task.projectId = :projectId', { projectId: group.projectId })
      .getMany();

    for (const task of tasks) {
      task.assignees = await this.enrichAssignees(task.assignees);
    }

    return tasks;
  }

  async findByProject(projectId: number, userId: number): Promise<Task[]> {
    await this.validateUserProjectAccess(projectId, userId);

    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.project', 'project')
      .where('task.projectId = :projectId', { projectId })
      .getMany();

    for (const task of tasks) {
      task.assignees = await this.enrichAssignees(task.assignees);
    }

    return tasks;
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId: number,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    if (!(await this.canModifyTask(id, userId))) {
      throw new ForbiddenException('Not authorized to modify this task');
    }

    if (updateTaskDto.projectId && updateTaskDto.projectId !== task.projectId) {
      await this.validateUserProjectAccess(updateTaskDto.projectId, userId);
    }

    if (updateTaskDto.assigneeIds) {
      const assignees = await this.usersService.findByIds(
        updateTaskDto.assigneeIds,
      );
      task.assignees = assignees;
    }

    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  async findMyTasks(userId: number): Promise<Task[]> {
    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.project', 'project')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('task_assignments.taskId')
          .from('task_assignments', 'task_assignments')
          .where('task_assignments.userId = :userId')
          .getQuery();
        return 'task.id IN ' + subQuery;
      })
      .setParameter('userId', userId)
      .getMany();

    // Enrich all tasks' assignees
    for (const task of tasks) {
      task.assignees = await this.enrichAssignees(task.assignees);
    }

    return tasks;
  }

  async assignUser(
    taskId: number,
    userId: number,
    assigneeId: number,
  ): Promise<Task> {
    if (!(await this.canModifyTask(taskId, userId))) {
      throw new ForbiddenException('Not authorized to modify this task');
    }

    const task = await this.findOne(taskId, userId);
    const newAssignee = await this.usersService.findOne(assigneeId);

    const assigneeGroups = await this.joinGroupRepository.find({
      where: { user_id: assigneeId },
    });
    const assigneeGroupIds = assigneeGroups.map((g) => g.group_id);

    const existingAssigneeGroups = await this.joinGroupRepository.find({
      where: { user_id: In(task.assignees.map((a) => a.id)) },
    });
    const existingGroupIds = existingAssigneeGroups.map((g) => g.group_id);

    if (
      !assigneeGroupIds.some((groupId) => existingGroupIds.includes(groupId))
    ) {
      throw new ForbiddenException(
        'New assignee must share a group with existing assignees',
      );
    }

    const currentAssignees = await this.usersService.findByIds(
      task.assignees.map((a) => a.id),
    );
    currentAssignees.push(newAssignee);

    // Update task with new assignees
    task.assignees = await this.enrichAssignees(currentAssignees);

    return await this.taskRepository.save(task);
  }

  async unassignUser(
    taskId: number,
    userId: number,
    assigneeId: number,
  ): Promise<Task> {
    if (!(await this.canModifyTask(taskId, userId))) {
      throw new ForbiddenException('Not authorized to modify this task');
    }

    const task = await this.findOne(taskId, userId);

    if (task.assignees.length <= 1) {
      throw new BadRequestException('Task must have at least one assignee');
    }

    const remainingAssignees = await this.usersService.findByIds(
      task.assignees
        .filter((assignee) => assignee.id !== assigneeId)
        .map((a) => a.id),
    );

    // Update task with remaining assignees
    task.assignees = await this.enrichAssignees(remainingAssignees);

    return await this.taskRepository.save(task);
  }

  private async validateUserProjectAccess(
    projectId: number,
    userId: number,
  ): Promise<void> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['groups'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const groupIds = project.groups.map((g) => g.id);
    const userInProject = await this.joinGroupRepository.findOne({
      where: { user_id: userId, group_id: In(groupIds) },
    });

    if (!userInProject) {
      throw new ForbiddenException('User does not have access to this project');
    }
  }
}
