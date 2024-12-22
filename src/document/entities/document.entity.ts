import { Task } from 'src/tasks/entities';
import { User } from 'src/users/entities';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity('documents')
export class DocumentFile {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;
  
  @Column()
  task_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: number;  

  @Column()
  originalname: string;
  @Column()
  mimetype: string;
  @Column()
  destination: string;
  @Column()
  filename: string;
  @Column()
  size: number;
}
