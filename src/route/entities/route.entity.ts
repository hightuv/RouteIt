import { Member } from 'src/member/entities/member.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoutePlace } from './route-place.entity';

@Entity()
export class Route {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Member, (member) => member.routes)
  member: Member;

  @OneToMany(() => RoutePlace, (routePlace) => routePlace.route)
  routePlaces: RoutePlace[];

  @ManyToMany(() => Tag, (tag) => tag.routes, {
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'route_tag' })
  tags: Tag[];

  @Column()
  isPublic: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
