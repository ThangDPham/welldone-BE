import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './entities/project.entity';
import { Group } from '../group/entities/group.entity';
import { JoinGroup } from '../group/entities/join_group.entity';
import { CreateProjectDto, UpdateProjectDto, QueryProjectsDto } from './dto';
import { UserRoles } from '../users/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { ProjectMember } from './types/project-member.type';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(JoinGroup)
    private joinGroupRepository: Repository<JoinGroup>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    private usersService: UsersService,
  ) {}

  private async validateUserIsLeader(
    userId: number,
    groupIds: number[],
  ): Promise<boolean> {
    const leaderMembership = await this.joinGroupRepository.findOne({
      where: {
        user_id: userId,
        group_id: In(groupIds),
        role: UserRoles.Leader,
      },
    });
    return !!leaderMembership;
  }

  async create(
    createProjectDto: CreateProjectDto,
    userId: number,
  ): Promise<Project> {
    const { groupIds, ...projectData } = createProjectDto;

    if (groupIds.length === 0) {
      throw new BadRequestException('At least one group must be specified');
    }

    const isLeader = await this.validateUserIsLeader(userId, groupIds);
    if (!isLeader) {
      throw new ForbiddenException(
        'You must be a leader in at least one of the specified groups',
      );
    }

    const groups = await this.groupRepository.find({
      where: { id: In(groupIds) },
    });

    if (groups.length !== groupIds.length) {
      throw new BadRequestException('One or more groups not found');
    }

    const groupsWithProject = groups.filter(
      (group) => group.projectId !== null,
    );
    if (groupsWithProject.length > 0) {
      throw new BadRequestException(
        `Groups ${groupsWithProject.map((g) => g.id).join(', ')} are already associated with other projects`,
      );
    }

    const project = this.projectsRepository.create(projectData);
    const savedProject = await this.projectsRepository.save(project);

    await this.groupRepository.update(
      { id: In(groupIds) },
      { projectId: savedProject.id },
    );

    return this.findOne(savedProject.id, userId);
  }

  async findAll(query: QueryProjectsDto, userId: number): Promise<Project[]> {
    const userGroups = await this.joinGroupRepository.find({
      where: { user_id: userId },
    });
    if (!userGroups.length) {
      return [];
    }
    const groupIds = userGroups.map((group) => group.group_id);

    const queryBuilder = this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.groups', 'group')
      .where('group.id IN (:...groupIds)', { groupIds });

    if (query.search) {
      queryBuilder.andWhere(
        '(project.name ILIKE :search OR project.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const projects = await queryBuilder.getMany();

    for (const project of projects) {
      await this.addUserGroupsToProject(project, userId);
    }

    return projects;
  }

  private async addUserGroupsToProject(
    project: Project,
    userId: number,
  ): Promise<void> {
    const userGroupMemberships = await this.joinGroupRepository.find({
      where: { user_id: userId },
    });

    const userGroupIds = userGroupMemberships.map(
      (membership) => membership.group_id,
    );

    const projectGroups = await this.groupRepository.find({
      where: {
        id: In(userGroupIds),
        projectId: project.id,
      },
      select: ['id', 'name'],
    });

    project.userGroups = projectGroups;
  }

  async findOne(id: number, userId: number): Promise<Project> {
    const project = await this.projectsRepository.findOne({
      where: { id },
      relations: ['groups'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const groupIds = project.groups.map((group) => group.id);
    const membership = await this.joinGroupRepository.findOne({
      where: {
        group_id: In(groupIds),
        user_id: userId,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this project');
    }

    await this.addUserGroupsToProject(project, userId);
    return project;
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    userId: number,
  ): Promise<Project> {
    const project = await this.findOne(id, userId);
    const groupIds = project.groups.map((group) => group.id);

    const isLeader = await this.validateUserIsLeader(userId, groupIds);
    if (!isLeader) {
      throw new ForbiddenException('Only group leaders can update projects');
    }

    await this.projectsRepository.update(id, updateProjectDto);
    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    const project = await this.findOne(id, userId);
    const groupIds = project.groups.map((group) => group.id);

    const isLeader = await this.validateUserIsLeader(userId, groupIds);
    if (!isLeader) {
      throw new ForbiddenException('Only group leaders can delete projects');
    }

    await this.projectsRepository.remove(project);
  }

  async addGroup(
    projectId: number,
    groupId: number,
    userId: number,
  ): Promise<Project> {
    const project = await this.findOne(projectId, userId);
    const groupIds = project.groups.map((group) => group.id);

    const isLeader = await this.validateUserIsLeader(userId, groupIds);
    if (!isLeader) {
      throw new ForbiddenException(
        'Only group leaders can add groups to projects',
      );
    }

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.projectId) {
      throw new BadRequestException(
        'Group is already associated with a project',
      );
    }

    group.projectId = projectId;
    await this.groupRepository.save(group);

    return this.findOne(projectId, userId);
  }

  async removeGroup(
    projectId: number,
    groupId: number,
    userId: number,
  ): Promise<Project> {
    const project = await this.findOne(projectId, userId);
    const groupIds = project.groups.map((group) => group.id);

    const isLeader = await this.validateUserIsLeader(userId, groupIds);
    if (!isLeader) {
      throw new ForbiddenException(
        'Only group leaders can remove groups from projects',
      );
    }

    if (project.groups.length <= 1) {
      throw new BadRequestException(
        'Cannot remove the last group from a project',
      );
    }

    const group = await this.groupRepository.findOne({
      where: { id: groupId, projectId },
    });
    if (!group) {
      throw new NotFoundException('Group not found in this project');
    }

    group.projectId = null;
    await this.groupRepository.save(group);

    return this.findOne(projectId, userId);
  }

  async getProjectMembers(
    id: number,
    userId: number,
  ): Promise<UserResponseDto[]> {
    const project = await this.findOne(id, userId);

    const groupIds = project.groups.map((group) => group.id);

    const memberships = await this.joinGroupRepository.find({
      where: { group_id: In(groupIds) },
    });

    const userRoleMap = new Map<number, UserRoles>();

    memberships.forEach((membership) => {
      const currentRole = userRoleMap.get(membership.user_id);
      if (
        !currentRole ||
        (membership.role === UserRoles.Leader &&
          currentRole === UserRoles.Member)
      ) {
        userRoleMap.set(membership.user_id, membership.role as UserRoles);
      }
    });

    const members: UserResponseDto[] = [];
    for (const [userId, role] of userRoleMap.entries()) {
      const userResponse = await this.usersService.getUserWithRole(
        userId,
        role,
      );
      members.push(userResponse);
    }

    return members;
  }

  async getProjectGroups(projectId: number, userId: number): Promise<Group[]> {
    const project = await this.findOne(projectId, userId);
    return project.groups;
  }
}
