import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Route } from './route.entity';
import { Place } from 'src/place/entities/place.entity';

@Entity()
export class RoutePlace {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Route, (route) => route.routePlaces, { onDelete: 'CASCADE' })
  route: Route;

  @ManyToOne(() => Place, (place) => place.routePlaces, { onDelete: 'CASCADE' })
  place: Place;

  @Column()
  position: number;
}
