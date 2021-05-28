import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  Unique,
  OneToMany,
} from "typeorm";
import { Address } from "./Address";

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

  @OneToMany(() => Address, address => address.user)
  addresses: Address[];

}
