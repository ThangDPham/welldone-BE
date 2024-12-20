import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
  } from 'typeorm';

  
  @Entity('group')
  export class Group {
    @PrimaryGeneratedColumn()
    id: number; 
    @Column({nullable: true,length: 100})
    name: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({nullable: true})
    description: string;

    @Column({nullable: true})
    user_id_create: number;
}