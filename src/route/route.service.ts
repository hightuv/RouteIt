import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { In, Like, Repository } from 'typeorm';
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
    const { name, placeIds, tagIds, isPublic, memberId } = createRouteDto;

    // 나중에는 인증 관련 절차로 변경
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const places = await Promise.all(
      placeIds.map((placeId) => this.placeService.getPlaceDetails(placeId)),
    );

    const tags = await this.tagRepository.find({
      where: { id: In(tagIds) },
    });

    if (tags.length !== tagIds.length) {
      throw new NotFoundException('Some tags not found');
    }

    const route = this.routeRepository.create({
      name,
      member,
      tags,
      isPublic,
    });
    await this.routeRepository.save(route);

    const routePlaces = placeIds.map((placeId, idx) => {
      const place = places.find((p) => p.id === placeId); // placeId 갱신 관련 이슈 + transaction 원자성 이슈
      return this.routePlaceRepository.create({
        route,
        place, // undefined (route정보에 undefined)
        position: idx + 1,
      });
    });

    await this.routePlaceRepository.save(routePlaces);
  }

  // 검색어 및 태그 (지금은 검색어만 구현)
  async findAll(searchText: string): Promise<RouteResponseDto[]> {
    const routes = await this.routeRepository.find({
      where: {
        name: Like(`%${searchText}%`),
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

  async findOne(id: number): Promise<RouteResponseDto> {
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
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ['routePlaces', 'tags', 'member'],
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    if (updateRouteDto.name !== undefined) {
      route.name = updateRouteDto.name;
    }

    if (updateRouteDto.isPublic !== undefined) {
      route.isPublic = updateRouteDto.isPublic;
    }

    if (updateRouteDto.tagIds) {
      const tags = await this.tagRepository.find({
        where: { id: In(updateRouteDto.tagIds) },
      });

      if (tags.length !== updateRouteDto.tagIds.length) {
        throw new NotFoundException('Some tags not found');
      }

      route.tags = tags;
    }

    if (updateRouteDto.placeIds) {
      await this.routePlaceRepository.delete({ route: { id: route.id } });

      const places = await Promise.all(
        updateRouteDto.placeIds.map((placeId) =>
          this.placeService.getPlaceDetails(placeId),
        ),
      );

      if (places.length !== updateRouteDto.placeIds.length) {
        throw new NotFoundException('Some places not found');
      }

      const newRoutePlaces = updateRouteDto.placeIds.map((placeId, idx) => {
        const place = places.find((p) => p.id === placeId);
        return this.routePlaceRepository.create({
          route,
          place,
          position: idx + 1,
        });
      });

      await this.routePlaceRepository.save(newRoutePlaces);
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
