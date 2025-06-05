import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlaceService } from './place.service';

@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @Get()
  async searchPlaces(@Query('search') search: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.placeService.searchPlaces(search);
  }

  @Get(':id')
  async getPlaceDetails(@Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.placeService.getPlaceDetails(id);
  }
}
