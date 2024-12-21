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
import { CreateGroupDto, GetGroupResponse, GetUserJoinedResponse, UpdateGroupDto } from './dto';
import { UserRoles } from 'src/users/enums';
import { Project } from 'src/projects/entities/project.entity';
import { UsersService } from 'src/users/users.service';
import { GroupMember } from './types/group-member.type';

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
  async create(
    createGroupDto: CreateGroupDto,
    user_id_create: number,
  ): Promise<Group> {
    const group = this.groupsRepository.create({
      ...createGroupDto,
      user_id_create,
    });

    const doneGroup = await this.groupsRepository.save(group);

    const join_group = this.joinGroupRepository.create();
    join_group.user_id = user_id_create;
    join_group.group_id = group.id;
    join_group.role = UserRoles.Leader;
    await this.joinGroupRepository.save(join_group);
        const groupsJoined = await this.joinGroupRepository.find({where: {group_id: group.id}});
        var groups = [];
        for (let group of groupsJoined) {
            const groupInfo =  await this.groupsRepository.findOneBy({id: group.group_id});
            var getGroupResponsense = new GetGroupResponse();
            getGroupResponsense.id = group.group_id;
            getGroupResponsense.role = group.role;
            getGroupResponsense.name = groupInfo.name;
            getGroupResponsense.description = groupInfo.description;
            getGroupResponsense.createdAt = groupInfo.createdAt;
            getGroupResponsense.updatedAt = groupInfo.updatedAt;
            getGroupResponsense.user = []; // Get user info from join_group table
            const userJoineds = await this.joinGroupRepository.find({where: {group_id: group.group_id}});
            for (let userJoined of userJoineds) {
                const user = await this.usersService.findOne(userJoined.user_id);
                getGroupResponsense.user.push(new GetUserJoinedResponse(user, userJoined.role));
            }
        }   

    return doneGroup;
  }

  async findAllByProjectId(projectId: number): Promise<Group[]> {
    return await this.groupsRepository.find({
      where: { projectId },
      relations: ['project'],
    });
  }

  async findOne(id: number): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: ['project'],
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
      });
      const getGroupResponsense = new GetGroupResponse();
      getGroupResponsense.id = groupInfo.id;
      getGroupResponsense.role = group.role;
      getGroupResponsense.name = groupInfo.name;
      getGroupResponsense.description = groupInfo.description;
      getGroupResponsense.createdAt = groupInfo.createdAt;
      getGroupResponsense.updatedAt = groupInfo.updatedAt;
      getGroupResponsense.user = []; // Get user info from join_group table
      const userJoineds = await this.joinGroupRepository.find({
        where: { group_id: group.group_id },
      });
      for (const userJoined of userJoineds) {
        const user = await this.usersService.findOne(userJoined.user_id);
        getGroupResponsense.user.push(new GetUserJoinedResponse(user, userJoined.role));
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
    const group = await this.findOne(id);

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

    return this.findOne(id);
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
    const group = await this.findOne(id);
    await this.joinGroupRepository.delete({group_id: group.id})
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    if (group.user_id_create !== user_id) {
      throw new NotFoundException('Not authorized to delete this group');
    }
    await this.groupsRepository.delete(id);
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    const joinGroupMembers = await this.joinGroupRepository.find({
      where: { group_id: groupId },
    });

    if (joinGroupMembers.length === 0) {
      return [];
    }

    const userIds = joinGroupMembers.map((member) => member.user_id);
    const users = await this.usersService.findByIds(userIds);

    return users.map((user) => {
      const joinGroup = joinGroupMembers.find((jg) => jg.user_id === user.id);
      const groupMember: GroupMember = {
        ...user,
        role: joinGroup.role as UserRoles,
      };
      return groupMember;
    });
  }

  async removeMember(
    groupId: number,
    userIdToRemove: number,
    currentUserId: number,
  ): Promise<void> {
    const group = await this.findOne(groupId);
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
