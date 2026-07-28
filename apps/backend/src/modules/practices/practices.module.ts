import { Module } from "@nestjs/common";
import { PracticesService } from "./practices.service";
import { PracticesController } from "./practices.controller";
import { StorageService } from "./storage.service";

@Module({
  controllers: [PracticesController],
  providers: [PracticesService, StorageService],
  exports: [PracticesService, StorageService],
})
export class PracticesModule {}
