import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlaceService } from './place.service';

@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get()
  async searchPlaces(@Query('search') search: string) {
    return this.placeService.searchPlaces(search);
  }

  @Get(':id')
  async getPlaceDetails(@Param('id') id: string) {
    return this.placeService.getPlaceDetails(id);
  }
}
