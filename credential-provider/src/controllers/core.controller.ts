import { ClaimSourceGuard } from '@/guards/claim-source.guard';
import { CoreService } from '@/services/core.service';
import { GenerateQrCodeDto } from '@/types/generate-qrcode.dto';
import { User } from '@/types/User';
import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';

@Controller('core')
export class CoreController {
  private readonly logger = new Logger(CoreController.name);

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
  public async render2faPage(@Req() req: Request, @Res() res: Response) {
    /**
     * Renderer for interaction-hook page
     *
     * 1. Extracts session_token from query param
     * 2. Calls CoreService.createResponseToken({ session_token }) -> callbackUrl
     * 3. Embed callbackUrl into object for template to map
     * 4. Render template when callbackUrl is created
     */
    const session_token = req.query.session_token as string;
    this.logger.debug(`Extracted session_token --> ${session_token}`);
    const callbackUrl = await this.coreService.createCallbackUrl({
      session_token,
    });
    return res.render('2fa', { callbackUrl });
  }
}
