import { Route } from 'src/route/entities/route.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password: string; // hashedPassword will be stored

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null; // hashedRefreshToken will be stored

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @OneToMany(() => Route, (route) => route.user)
  routes: Route[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
