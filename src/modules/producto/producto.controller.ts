import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Req } from '@nestjs/common';
import type { Request } from 'express';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('producto')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Get()
  findAll() {
    return this.productoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productoService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads/productos',
        filename: (req, file, cb) => {
          const fileExt = extname(file.originalname);
          cb(null, `${Date.now()}${fileExt}`);
        },
      }),
    }),
  )
  create(
    @Req() req: Request,
    @Body() dto: CreateProductoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = (req as any).user?.sub; // JWT payload: sub
    return this.productoService.create(dto, file?.path, userId);
  }


  @Put(':id')
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: './uploads/productos',
        filename: (req, file, cb) => {
          const fileExt = extname(file.originalname);
          cb(null, `${Date.now()}${fileExt}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productoService.update(id, dto, file?.path);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productoService.remove(id);
  }
}
