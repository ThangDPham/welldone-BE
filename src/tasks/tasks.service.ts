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
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';
import { JoinGroup } from '../group/entities/join_group.entity';
import { Project } from '../projects/entities/project.entity';
import { In } from 'typeorm';
import { UserRoles } from '../users/enums/user-role.enum';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(JoinGroup)
    private joinGroupRepository: Repository<JoinGroup>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private projectsService: ProjectsService,
    private usersService: UsersService,
  ) {}

  private async validateProjectAccess(
    projectId: number,
    userId: number,
  ): Promise<void> {
    const project = await this.projectsService.findOne(projectId, userId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }
  }

  private async getProjectMembers(projectId: number): Promise<number[]> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['groups'],
    });

    const groupIds = project.groups.map((group) => group.id);
    const memberships = await this.joinGroupRepository.find({
      where: { group_id: In(groupIds) },
    });

    return [...new Set(memberships.map((m) => m.user_id))];
  }

  private async isProjectLeader(
    projectId: number,
    userId: number,
  ): Promise<boolean> {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId },
      relations: ['groups'],
    });

    const groupIds = project.groups.map((group) => group.id);
    const leaderMembership = await this.joinGroupRepository.findOne({
      where: {
        group_id: In(groupIds),
        user_id: userId,
        role: UserRoles.Leader,
      },
    });

    return !!leaderMembership;
  }

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    await this.validateProjectAccess(createTaskDto.projectId, userId);

    const projectMemberIds = await this.getProjectMembers(
      createTaskDto.projectId,
    );
    const invalidAssignees = createTaskDto.assigneeIds.filter(
      (id) => !projectMemberIds.includes(id),
    );

    if (invalidAssignees.length > 0) {
      throw new BadRequestException(
        'All assignees must be members of the project',
      );
    }

    const assignees = await this.usersService.findByIds(
      createTaskDto.assigneeIds,
    );
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdById: userId,
      assignees,
    });

    const savedTask = await this.taskRepository.save(task);
    return this.enrichTaskWithUserRoles(savedTask, createTaskDto.projectId);
  }

  async findAll(query: QueryTasksDto, userId: number): Promise<Task[]> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.createdBy', 'createdBy');

    const userMemberships = await this.joinGroupRepository.find({
      where: { user_id: userId },
    });

    const groupIds = userMemberships.map((m) => m.group_id);
    const projects = await this.projectsRepository.find({
      where: { groups: { id: In(groupIds) } },
    });
    const projectIds = projects.map((p) => p.id);

    if (projectIds.length === 0) {
      return [];
    }

    queryBuilder.andWhere('task.projectId IN (:...projectIds)', { projectIds });

    if (query.status) {
      queryBuilder.andWhere('task.status = :status', { status: query.status });
    }

    if (query.priority) {
      queryBuilder.andWhere('task.priority = :priority', {
        priority: query.priority,
      });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const tasks = await queryBuilder.getMany();
    return Promise.all(
      tasks.map((task) => this.enrichTaskWithUserRoles(task, task.projectId)),
    );
  }

  private async enrichTaskWithUserRoles(
    task: Task,
    projectId: number,
  ): Promise<Task> {
    if (task.assignees) {
      const assigneesWithRoles: UserResponseDto[] = [];
      for (const assignee of task.assignees) {
        const membership = await this.joinGroupRepository.findOne({
          where: {
            user_id: assignee.id,
            group_id: In(
              (
                await this.projectsRepository.findOne({
                  where: { id: projectId },
                  relations: ['groups'],
                })
              ).groups.map((g) => g.id),
            ),
          },
        });

        const userResponse = await this.usersService.getUserWithRole(
          assignee.id,
          (membership?.role as UserRoles) || UserRoles.Member,
        );
        assigneesWithRoles.push(userResponse);
      }
      task.assignees = assigneesWithRoles;
    }
    return task;
  }

  async findOne(id: number, userId: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignees', 'project', 'createdBy'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.validateProjectAccess(task.projectId, userId);
    return this.enrichTaskWithUserRoles(task, task.projectId);
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId: number,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    if (updateTaskDto.assigneeIds) {
      const projectMemberIds = await this.getProjectMembers(task.projectId);
      const invalidAssignees = updateTaskDto.assigneeIds.filter(
        (id) => !projectMemberIds.includes(id),
      );

      if (invalidAssignees.length > 0) {
        throw new BadRequestException(
          'All assignees must be members of the project',
        );
      }

      const assignees = await this.usersService.findByIds(
        updateTaskDto.assigneeIds,
      );
      task.assignees = assignees;
    }

    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id, userId);
    const isLeader = await this.isProjectLeader(task.projectId, userId);

    if (task.createdById !== userId && !isLeader) {
      throw new ForbiddenException(
        'Only task creator or project leader can delete tasks',
      );
    }

    await this.taskRepository.remove(task);
  }

  async assignUser(
    taskId: number,
    userId: number,
    assigneeId: number,
  ): Promise<Task> {
    const task = await this.findOne(taskId, userId);
    const assignee = await this.usersService.findOne(assigneeId);
    const projectMemberIds = await this.getProjectMembers(task.projectId);

    if (!projectMemberIds.includes(assigneeId)) {
      throw new BadRequestException('Assignee must be a member of the project');
    }

    task.assignees.push(assignee);
    return await this.taskRepository.save(task);
  }

  async unassignUser(
    taskId: number,
    userId: number,
    assigneeId: number,
  ): Promise<Task> {
    const task = await this.findOne(taskId, userId);
    task.assignees = task.assignees.filter(
      (assignee) => assignee.id !== assigneeId,
    );
    return await this.taskRepository.save(task);
  }
}
