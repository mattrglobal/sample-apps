import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GenerateQrCodeDto {
  @ApiProperty({
    required: true,
    type: String,
  })
  @IsString()
  ngrokUrl: string;
}
