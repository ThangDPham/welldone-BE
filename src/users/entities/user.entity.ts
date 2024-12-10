import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { UserStatus } from '../enums/user-status.enum';
import { UserRoles } from '../enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  firstname: string;

  @Column({ length: 100 })
  lastname: string;

  @Column()
  dateofbirth: Date;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({nullable: true})
  //@ManyToOne()
  group_id: number;

  @Column({nullable: true})
  joined_at: Date;

  @Column({
    type: 'enum',
    enum: UserRoles,
    default: UserRoles.Member,
  })
  role: UserRoles;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, length: 6 })
  verificationCode: string;

  @Column({ nullable: true })
  verificationCodeExpiresAt: Date;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.OFFLINE,
  })
  status: UserStatus;

  @Column({ nullable: true, length: 6 })
  passwordResetCode: string;

  @Column({ nullable: true })
  passwordResetCodeExpiresAt: Date;
}
