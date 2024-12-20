import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
// import { CreateUserDto, UpdateUserDto } from './dto';
import { Group } from './entities';
import { JoinGroup } from './entities/join_group.entity';
import { CreateGroupDto, GetGroupResponse, UpdateGroupDto } from './dto';
import { UserRoles } from 'src/users/enums';
import { User } from 'src/users/entities';
import { UsersService } from 'src/users/users.service';
@Injectable()

export class GroupsService {
    constructor(
        @InjectRepository(Group)
        private groupsRepository: Repository<Group>,
        @InjectRepository(JoinGroup)
        private joinGroupRepository: Repository<JoinGroup>,
        private usersService: UsersService,
    ) {}
    async create(createGroupDto: CreateGroupDto, user_id_create: number): Promise<Group> {
        const group = this.groupsRepository.create(createGroupDto);
        group.user_id_create = user_id_create;
        const doneGroup = await this.groupsRepository.save(group);

        const join_group = this.joinGroupRepository.create();
        join_group.user_id = user_id_create;
        join_group.group_id = group.id;
        join_group.role = UserRoles.Leader;
        await this.joinGroupRepository.save(join_group);
        for (let member of createGroupDto.list_user_members) {
            const join_group_member = this.joinGroupRepository.create();
            join_group_member.user_id = member;
            join_group_member.group_id = doneGroup.id;
            join_group_member.role = UserRoles.Member;
            join_group_member.join_at = new Date();
            await this.joinGroupRepository.save(join_group_member);
        }

        return doneGroup;
    }
    async findAll(): Promise<Group[]> {
        return await this.groupsRepository.find();
    }
    async findOne(id: number): Promise<Group> {
        const group = await this.groupsRepository.findOne({where: {id}});
        if (!group) {
            throw new NotFoundException('Group not found');
        }
        return group;
    }
    async findbyName(name: string): Promise<Group[]> {
        const group = await this.groupsRepository.find({where: {name}});
        if (!group) {
            throw new NotFoundException('Group not found');
        }
        return group;
    }
    async findAllByUserId(user_id: number): Promise<GetGroupResponse[]> {
        const groupsJoined = await this.joinGroupRepository.find({where: {user_id: user_id}});
        if (groupsJoined.length == 0) {
            throw new NotFoundException('Groups not found');
        }

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
                getGroupResponsense.user.push(user);
            }
            

            groups.push(getGroupResponsense);
        }
        return groups;
    }
    async update(id : number, updateGroupDto: UpdateGroupDto, user_id: number): Promise<void> {
        const group = await this.findOne(id);
        if (!group) {
            throw new NotFoundException('Group not found');
        }
        if (group.user_id_create !== user_id) {
            throw new NotFoundException('Not authorized to update this group');
        }
        const { name, description, list_user_members } = updateGroupDto;
        group.name = name;
        group.description = description;
        if (list_user_members) {
            await this.joinGroupRepository.delete({group_id: group.id});
            for (let member of list_user_members) {
                const join_group_member = this.joinGroupRepository.create();
                join_group_member.user_id = member;
                join_group_member.group_id = group.id;
                join_group_member.role = UserRoles.Member;
                join_group_member.join_at = new Date();
                await this.joinGroupRepository.save(join_group_member);
            }
        }
        await this.groupsRepository.save(group);
    }
    async remove(id: number, user_id: number): Promise<void> {
        const group = await this.findOne(id);
        if (!group) {
            throw new NotFoundException('Group not found');
        }
        if (group.user_id_create!== user_id) {
            throw new NotFoundException('Not authorized to delete this group');
        }
        await this.joinGroupRepository.delete({group_id: group.id});
        await this.groupsRepository.delete(id);
    }
}