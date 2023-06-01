import { ClaimSourceGuard } from '@/guards/claim-source.guard';
import { CoreService } from '@/services/core.service';
import { GenerateQrCodeDto } from '@/types/generate-qrcode.dto';
import { User } from '@/types/User';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';

@Controller('core')
export class CoreController {
  constructor(private readonly coreService: CoreService) {}

  @Post('qrcode')
  @ApiCreatedResponse({ description: 'QR Code URL created' })
  public async createQrCodeUrl(
    @Body() body: GenerateQrCodeDto,
  ): Promise<string> {
    return this.coreService.createQrCodeUrl(body.ngrokUrl);
  }

  @Get('user')
  @UseGuards(ClaimSourceGuard)
  public async getUser(@Query('email') email: string): Promise<User | object> {
    return this.coreService.getUser({ email });
  }

  @Get('2fa')
  @Render('2fa')
  public async render2faPage() {
    return;
  }
}
