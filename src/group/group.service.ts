import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { CreateUserDto, UpdateUserDto } from './dto';
import { Group } from './entities';
import { JoinGroup } from './entities/join_group.entity';
import {
  CreateGroupDto,
  GetGroupResponse,
  GetUserJoinedResponse,
  UpdateGroupDto,
} from './dto';
import { UserRoles } from 'src/users/enums';
import { Project } from 'src/projects/entities/project.entity';
import { UsersService } from 'src/users/users.service';
import { GroupMember } from './types/group-member.type';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(JoinGroup)
    private joinGroupRepository: Repository<JoinGroup>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private usersService: UsersService,
  ) {}

  private async getGroupResponse(
    groupId: number,
    userId: number,
  ): Promise<GetGroupResponse> {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: ['project'], // Add project relation
    });

    const userRole = await this.joinGroupRepository.findOne({
      where: { group_id: groupId, user_id: userId },
    });

    const response = new GetGroupResponse();
    response.id = group.id;
    response.name = group.name;
    response.description = group.description;
    response.createdAt = group.createdAt;
    response.updatedAt = group.updatedAt;
    response.role = userRole.role;
    response.projectId = group.projectId;
    response.projectName = group.project?.name;
    response.user = await this.getGroupMembers(groupId);

    return response;
  }

  async create(
    createGroupDto: CreateGroupDto,
    user_id_create: number,
  ): Promise<GetGroupResponse> {
    const group = this.groupsRepository.create({
      ...createGroupDto,
      user_id_create,
    });

    const doneGroup = await this.groupsRepository.save(group);

    const leaderJoinGroup = this.joinGroupRepository.create({
      user_id: user_id_create,
      group_id: doneGroup.id,
      role: UserRoles.Leader,
    });
    await this.joinGroupRepository.save(leaderJoinGroup);

    if (createGroupDto.list_user_members?.length > 0) {
      const memberJoinGroups = createGroupDto.list_user_members.map(
        (memberId) => ({
          user_id: memberId,
          group_id: doneGroup.id,
          role: UserRoles.Member,
          join_at: new Date(),
        }),
      );

      await this.joinGroupRepository.insert(memberJoinGroups);
    }

    return this.getGroupResponse(doneGroup.id, user_id_create);
  }

  async findAllByProjectId(projectId: number): Promise<Group[]> {
    return await this.groupsRepository.find({
      where: { projectId },
      relations: ['project'],
    });
  }

  async findOnebyId(id: number): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id },
      // relations: ['project'],
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }
  async findbyName(name: string): Promise<Group[]> {
    const group = await this.groupsRepository.find({ where: { name } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }
  async findAllByUserId(user_id: number): Promise<GetGroupResponse[]> {
    const groupsJoined = await this.joinGroupRepository.find({
      where: { user_id: user_id },
    });
    if (groupsJoined.length == 0) {
      throw new NotFoundException('Groups not found');
    }

    const groups = [];
    for (const group of groupsJoined) {
      const groupInfo = await this.groupsRepository.findOne({
        where: { id: group.group_id },
        relations: ['project'], // Add project relation
      });
      const getGroupResponsense = new GetGroupResponse();
      getGroupResponsense.id = groupInfo.id;
      getGroupResponsense.role = group.role;
      getGroupResponsense.name = groupInfo.name;
      getGroupResponsense.description = groupInfo.description;
      getGroupResponsense.createdAt = groupInfo.createdAt;
      getGroupResponsense.updatedAt = groupInfo.updatedAt;
      getGroupResponsense.projectId = groupInfo.projectId;
      getGroupResponsense.projectName = groupInfo.project?.name;
      getGroupResponsense.user = [];

      const userJoineds = await this.joinGroupRepository.find({
        where: { group_id: group.group_id },
      });

      for (const userJoined of userJoineds) {
        const userResponse = await this.usersService.getUserWithRole(
          userJoined.user_id,
          userJoined.role as UserRoles,
        );
        getGroupResponsense.user.push(userResponse);
      }

      groups.push(getGroupResponsense);
    }
    return groups;
  }

  async update(
    id: number,
    updateGroupDto: UpdateGroupDto,
    user_id: number,
  ): Promise<Group> {
    const group = await this.findOnebyId(id);

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.user_id_create !== user_id) {
      throw new NotFoundException('Not authorized to update this group');
    }

    const { name, description, list_user_members } = updateGroupDto;

    // Update basic group info
    const updatedGroup = await this.groupsRepository.save({
      ...group,
      name: name || group.name,
      description: description || group.description,
    });

    if (list_user_members?.length > 0) {
      await this.addNewGroupMembers(group.id, list_user_members);
    }

    return this.findOnebyId(id);
  }

  private async addNewGroupMembers(
    groupId: number,
    newMemberIds: number[],
  ): Promise<void> {
    const currentMembers = await this.joinGroupRepository.find({
      where: { group_id: groupId },
    });

    const currentMemberIds = new Set(
      currentMembers.map((member) => member.user_id),
    );

    const membersToAdd = newMemberIds.filter((id) => !currentMemberIds.has(id));

    if (membersToAdd.length > 0) {
      const newJoinGroups = membersToAdd.map((memberId) => ({
        user_id: memberId,
        group_id: groupId,
        role: UserRoles.Member,
        join_at: new Date(),
      }));

      await this.joinGroupRepository.insert(newJoinGroups);
    }
  }

  async remove(id: number, user_id: number): Promise<void> {
    const group = await this.findOnebyId(id);
    await this.joinGroupRepository.delete({ group_id: group.id });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    if (group.user_id_create !== user_id) {
      throw new NotFoundException('Not authorized to delete this group');
    }
    await this.groupsRepository.delete(id);
  }

  async getGroupMembers(groupId: number): Promise<UserResponseDto[]> {
    const joinGroupMembers = await this.joinGroupRepository.find({
      where: { group_id: groupId },
    });

    if (joinGroupMembers.length === 0) {
      return [];
    }

    const members: UserResponseDto[] = [];
    for (const member of joinGroupMembers) {
      const userResponse = await this.usersService.getUserWithRole(
        member.user_id,
        member.role as UserRoles,
      );
      members.push(userResponse);
    }

    return members;
  }

  async removeMember(
    groupId: number,
    userIdToRemove: number,
    currentUserId: number,
  ): Promise<void> {
    const group = await this.findOnebyId(groupId);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const memberToRemove = await this.joinGroupRepository.findOne({
      where: { group_id: groupId, user_id: userIdToRemove },
    });
    if (!memberToRemove) {
      throw new NotFoundException('Member not found in group');
    }

    if (currentUserId !== userIdToRemove) {
      const currentUserRole = await this.joinGroupRepository.findOne({
        where: { group_id: groupId, user_id: currentUserId },
      });
      if (!currentUserRole || currentUserRole.role !== UserRoles.Leader) {
        throw new ForbiddenException('Only group leaders can remove members');
      }
    }

    if (memberToRemove.role === UserRoles.Leader) {
      const leadersCount = await this.joinGroupRepository.count({
        where: { group_id: groupId, role: UserRoles.Leader },
      });
      if (leadersCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last leader from the group',
        );
      }
    }

    await this.joinGroupRepository.remove(memberToRemove);
  }
}
