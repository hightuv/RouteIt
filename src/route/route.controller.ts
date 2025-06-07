import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RouteService } from './route.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routeService.create(createRouteDto);
  }

  @Get()
  findRoutes(
    @Query('searchText') searchText?: string,
    @Query('tagIds') tagIds?: string,
  ) {
    const tagIdArray = tagIds ? tagIds.split(',').map(Number) : undefined;
    return this.routeService.findRoutes(searchText, tagIdArray);
  }

  @Get(':id')
  findRoute(@Param('id') id: string) {
    return this.routeService.findRoute(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto) {
    return this.routeService.update(+id, updateRouteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.routeService.remove(+id);
  }
}
