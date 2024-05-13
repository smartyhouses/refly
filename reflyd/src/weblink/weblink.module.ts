import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

import { WeblinkController } from './weblink.controller';
import { WeblinkService } from './weblink.service';

import { WeblinkProcessor } from './weblink.processor';
import { CommonModule } from '../common/common.module';
import { AigcModule } from '../aigc/aigc.module';
import { LlmModule } from '../llm/llm.module';
import { RAGModule } from '../rag/rag.module';
import { QUEUE_WEBLINK } from '../utils/const';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    LlmModule,
    AigcModule,
    RAGModule,
    BullModule.registerQueue({ name: QUEUE_WEBLINK }),
  ],
  controllers: [WeblinkController],
  providers: [WeblinkService, WeblinkProcessor],
  exports: [WeblinkService],
})
export class WeblinkModule {}
