import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { PdfParserService } from './pdf-parser.service';

@Module({
  controllers: [ModulesController],
  providers: [ModulesService, PdfParserService],
  exports: [ModulesService],
})
export class ModulesModule {}
