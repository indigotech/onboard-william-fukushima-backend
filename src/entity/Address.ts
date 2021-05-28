import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class Address {
  @PrimaryColumn()
  id: number;

  @Column()
  CEP: string;

  @Column()
  street: string;

  @Column()
  streetNumber: number;

  @Column()
  neighborhood: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({nullable: true})
  complement: string;

  @ManyToOne(() => User, user => user.addresses, {cascade: true, onDelete: "CASCADE"})
  userID: User;
}
