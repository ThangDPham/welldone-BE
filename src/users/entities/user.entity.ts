import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatus } from '../enums/user-status.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  // @Column({ length: 100 })
  // lastname: string;

  @Column({ nullable: true })
  dateofbirth: Date;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

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
