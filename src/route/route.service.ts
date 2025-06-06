import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { DataSource, In, Like, Repository } from 'typeorm';
import { Member } from 'src/member/entities/member.entity';
import { Tag } from 'src/tag/entities/tag.entity';
import { RouteResponseDto } from './dto/route-response.dto';
import { RoutePlace } from './entities/route-place.entity';
import { plainToInstance } from 'class-transformer';
import { PlaceResponseDto } from 'src/place/dto/place-response.dto';
import { PlaceService } from 'src/place/place.service';

@Injectable()
export class RouteService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,

    @InjectRepository(RoutePlace)
    private readonly routePlaceRepository: Repository<RoutePlace>,

    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,

    private readonly placeService: PlaceService,
  ) {}

  async create(createRouteDto: CreateRouteDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { name, placeIds, tagIds, isPublic, memberId } = createRouteDto;

      const member = await queryRunner.manager.findOne(Member, {
        where: { id: memberId },
      });

      // 나중에는 인증 관련 절차로 변경

      if (!member) {
        throw new NotFoundException('Member not found');
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
        member,
        tags,
        isPublic,
      });

      await queryRunner.manager.save(route);

      const routePlaces = placeIds.map((placeId, idx) => {
        const place = places.find((p) => p.id === placeId); // placeId 갱신 관련 이슈
        return queryRunner.manager.create(RoutePlace, {
          route,
          place, // undefined (route정보에 undefined)
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
  async findBySearchText(
    searchText?: string,
    tagIds?: number[],
  ): Promise<RouteResponseDto[]> {
    // 1. tagIds에 해당하는 Route id만 먼저 조회
    const routeIds = await this.routeRepository
      .createQueryBuilder('route')
      .leftJoin('route.tags', 'tag')
      .where('tag.id IN (:...tagIds)', { tagIds })
      .getMany()
      .then((routes) => routes.map((r) => r.id));

    // 2. 해당 Route id로 전체 태그 포함 조회
    const routes = await this.routeRepository.find({
      where: {
        id: In(routeIds),
        name: searchText ? Like(`%${searchText}%`) : undefined,
      },
      relations: ['routePlaces', 'routePlaces.place', 'tags', 'member'],
    });

    return routes.map((route) => {
      route.routePlaces = route.routePlaces.sort(
        (a, b) => a.position - b.position,
      );
      return this.toRouteResponseDto(route);
    });
  }

  async findRoute(id: number): Promise<RouteResponseDto> {
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ['routePlaces', 'routePlaces.place', 'tags', 'member'],
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    route.routePlaces = [...route.routePlaces].sort(
      (a, b) => a.position - b.position,
    );

    return this.toRouteResponseDto(route);
  }

  async update(id: number, updateRouteDto: UpdateRouteDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Route 조회
      const route = await queryRunner.manager.findOne(Route, {
        where: { id },
        relations: ['routePlaces', 'tags', 'member'],
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

        const places = await Promise.all(
          updateRouteDto.placeIds.map((placeId) =>
            this.placeService.getPlaceDetails(placeId, queryRunner.manager),
          ),
        );

        if (places.length !== updateRouteDto.placeIds.length) {
          throw new NotFoundException('Some places not found');
        }

        const newRoutePlaces = updateRouteDto.placeIds.map((placeId, idx) => {
          const place = places.find((p) => p.id === placeId);
          return queryRunner.manager.create(RoutePlace, {
            route,
            place,
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
    const route = await this.routeRepository.findOne({
      where: { id },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    await this.routeRepository.delete(id);
  }

  private toRouteResponseDto(route: Route): RouteResponseDto {
    const sortedRoutePlaces = [...route.routePlaces].sort(
      (a, b) => a.position - b.position,
    );

    const places = plainToInstance(
      PlaceResponseDto,
      sortedRoutePlaces.map((rp) => ({
        ...rp.place,
        position: rp.position,
      })),
    );

    return plainToInstance(RouteResponseDto, {
      name: route.name,
      memberName: route.member.name,
      tags: route.tags.map((tag) => tag.name),
      places,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
    });
  }
}
