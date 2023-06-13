import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { getNgrokUrl } from './common/helpers';
import { CoreController } from './controllers/core.controller';
import { CoreService } from './services/core.service';
import { MattrService } from './services/mattr.service';
import { AppConfig } from './validators/env.validator';
// import * as hbs from 'handlebars';

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  // app.engine('hbs', hbs({ extname: 'hbs', helpers: createResponseToken }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MATTR Sample App - Credential Provider')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const port = parseInt(process.env.PORT) || 3000;
  // const port = 1234;
  await app.listen(port);

  const appConfig = new ConfigService<AppConfig>();
  const authtoken = appConfig.get('NGROK_AUTH_TOKEN');
  const ngrokUrl = await getNgrokUrl({ port, authtoken });
  const logger = new Logger(bootstrap.name);

  logger.log(`💫 App running on https://localhost:${port}`);
  logger.log(`🎨 Swagger UI running on https://localhost:${port}/api`);
  logger.log(`👉 Your Ngrok URL: ${ngrokUrl}`);

  // Hitting CoreController.createQrCodeUrl on startup
  const configService = new ConfigService<AppConfig>();
  const httpService = new HttpService();
  const jwtService = new JwtService();
  const mattrService = new MattrService(configService, httpService);
  const coreService = new CoreService(mattrService, configService, jwtService);
  // const coreController = new CoreController(coreService);
  // coreController.createQrCodeUrl({ ngrokUrl });

  console.log(`Decoding JWT`);
  const session_token = ``;
  const callbackUrl = await coreService.createResponseToken({
    session_token,
    app_url: `${ngrokUrl}/core/2fa`,
  });
  logger.log(`callbackUrl -> ${callbackUrl}`);
};

bootstrap();
