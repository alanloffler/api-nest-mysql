import { ActiveUser } from '../common/decorators/active-user.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { Controller, Get, Post, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { IActiveUser } from '../common/interfaces/active-user.interface';
import { Role } from '../common/enums/role.enum';

@Auth(Role.USER)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':id')
  create(@Param('id', ParseIntPipe) id: number, @ActiveUser() activeUser: IActiveUser) {
    return this.favoritesService.create(id, activeUser);
  }

  @Get()
  findAll(@ActiveUser() activeUser: IActiveUser) {
    return this.favoritesService.findAll(activeUser);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.favoritesService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.favoritesService.remove(+id);
  }
}
