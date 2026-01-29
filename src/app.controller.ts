import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}
