import { UserRoles } from 'src/users/enums';
import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
  } from 'typeorm';

  
  @Entity('join_group')
  export class JoinGroup {
    @PrimaryColumn()
    user_id: number; 
    @PrimaryColumn()
    group_id: number;
    @CreateDateColumn()
    join_at: Date;
    @Column({type: 'enum',
        enum: UserRoles,
        default: UserRoles.Member})
    role: string;
}