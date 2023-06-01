import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from './modules/core.module';
import { validate } from './validators/env.validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      validate,
    }),
    CoreModule,
  ],
})
export class AppModule {}
