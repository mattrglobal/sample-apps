import { CoreController } from '@/controllers/core.controller';
import { LoggingInterceptor } from '@/interceptors/logging.interceptor';
import { CoreService } from '@/services/core.service';
import { MattrService } from '@/services/mattr.service';
import { HttpModule } from '@nestjs/axios';
import { Module, Scope } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [HttpModule, ConfigModule, JwtModule],
  controllers: [CoreController],
  providers: [
    CoreService,
    MattrService,
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: LoggingInterceptor,
    },
  ],
})
export class CoreModule {}
