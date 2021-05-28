import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  Unique,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  @Column()
  birthDate: string;
}
