import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { DataSource, In, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { RouteResponseDto } from './dto/route-response.dto';
import { RoutePlace } from './entities/route-place.entity';
import { plainToInstance } from 'class-transformer';
import { PlaceService } from 'src/place/place.service';
import { Place } from 'src/place/entities/place.entity';

@Injectable()
export class RouteService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,

    private readonly placeService: PlaceService,
  ) {}

  async create(createRouteDto: CreateRouteDto) {
    console.log('create');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { name, placeIds, tagIds, isPublic, userId } = createRouteDto;

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });

      // 나중에는 인증 관련 절차로 변경

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const places = await Promise.all(
        placeIds.map((placeId) =>
          this.placeService.getPlaceDetails(placeId, queryRunner.manager),
        ),
      );

      const tags = await queryRunner.manager.find(Tag, {
        where: { id: In(tagIds) },
      });

      if (tags.length !== tagIds.length) {
        throw new NotFoundException('Some tags not found');
      }

      const route = queryRunner.manager.create(Route, {
        name,
        user,
        tags,
        isPublic,
      });

      await queryRunner.manager.save(route);

      // getPlaceDetails는 항상 갱신된 placeId를 보장
      const routePlaces = places.map((place, idx) => {
        return queryRunner.manager.create(RoutePlace, {
          route,
          place, // 항상 최신 placeId
          position: idx + 1,
        });
      });

      await queryRunner.manager.save(routePlaces);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 검색어 및 태그 (지금은 검색어만 구현)
  async findRoutes(searchText?: string, tagIds?: number[]): Promise<RouteResponseDto[]> {
    console.log('findRoutes');

    const qb = this.routeRepository.createQueryBuilder('route').select('route.id', 'id');

    // Tag 조인
    if (tagIds && tagIds.length > 0) {
      qb.leftJoin('route.tags', 'tag').andWhere('tag.id IN (:...tagIds)', { tagIds });
    }

    // searchText 조건
    if (searchText) {
      qb.andWhere('route.name LIKE :searchText', { searchText: `%${searchText}%` });
    }

    const rows: { id: number }[] = await qb.getRawMany();
    const routeIds = rows.map((row) => row.id);

    if (routeIds.length === 0) {
      return [];
    }

    const routes = await this.routeRepository.find({
      where: { id: In(routeIds) },
      relations: ['routePlaces', 'tags', 'user'],
      order: { routePlaces: { position: 'ASC' } },
    });

    return await Promise.all(
      routes.map(async (route) => {
        const placeIds = route.routePlaces.map((rp) => rp.placeId);
        const places = await Promise.all(
          placeIds.map((placeId) => this.placeService.getPlaceDetails(placeId)),
        );
        return this.toRouteResponseDto(route, places);
      }),
    );
  }

  async findRoute(id: number): Promise<RouteResponseDto> {
    console.log('findRoute');
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ['routePlaces', 'tags', 'user'],
      order: { routePlaces: { position: 'ASC' } },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    const placeIds = route.routePlaces.map((rp) => rp.placeId);

    const places = await Promise.all(
      placeIds.map((placeId) => this.placeService.getPlaceDetails(placeId)),
    );

    return this.toRouteResponseDto(route, places);
  }

  async update(id: number, updateRouteDto: UpdateRouteDto) {
    console.log('update');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Route 조회
      const route = await queryRunner.manager.findOne(Route, {
        where: { id },
        relations: ['routePlaces', 'tags', 'user'],
      });
      if (!route) {
        throw new NotFoundException('Route not found');
      }

      // 2. 필드 변경
      if (updateRouteDto.name !== undefined) {
        route.name = updateRouteDto.name;
      }

      if (updateRouteDto.isPublic !== undefined) {
        route.isPublic = updateRouteDto.isPublic;
      }

      // 3. 태그 변경
      if (updateRouteDto.tagIds) {
        const tags = await queryRunner.manager.find(Tag, {
          where: { id: In(updateRouteDto.tagIds) },
        });

        if (tags.length !== updateRouteDto.tagIds.length) {
          throw new NotFoundException('Some tags not found');
        }

        route.tags = tags;
      }

      // 4. Route 수정사항 반영
      await queryRunner.manager.save(route);

      // 5. Route-Place 관계 변경
      if (updateRouteDto.placeIds) {
        await queryRunner.manager.delete(RoutePlace, {
          route: { id: route.id },
        });

        // getPlaceDetails는 항상 갱신된 placeId를 보장
        const places = await Promise.all(
          updateRouteDto.placeIds.map((placeId) =>
            this.placeService.getPlaceDetails(placeId, queryRunner.manager),
          ),
        );

        if (places.length !== updateRouteDto.placeIds.length) {
          throw new NotFoundException('Some places not found');
        }

        const newRoutePlaces = places.map((place, idx) => {
          return queryRunner.manager.create(RoutePlace, {
            route,
            place, // 최신 placeId가 반영됨
            position: idx + 1,
          });
        });

        await queryRunner.manager.save(RoutePlace, newRoutePlaces);
      }
      // 커밋
      await queryRunner.commitTransaction();
    } catch (err) {
      // 롤백
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    console.log('remove');
    const route = await this.routeRepository.findOne({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    await this.routeRepository.delete(id);
  }

  private toRouteResponseDto(route: Route, places: Place[]): RouteResponseDto {
    const dto = plainToInstance(
      RouteResponseDto,
      {
        ...route,
        places,
      },
      {
        excludeExtraneousValues: true,
      },
    );

    return dto;
  }
}
