import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BalanceService } from './balance.service';

@Controller()
export class BalanceController {
  private readonly logger = new Logger(BalanceController.name);

  constructor(private readonly balanceService: BalanceService) {}

  @MessagePattern('BALANCE_CHECK')
  async processBalanceCheck(@Payload() data: any) {
    this.logger.log(`Received BALANCE_CHECK event: ${JSON.stringify(data)}`);
    return this.balanceService.processBalanceCheck(data);
  }
}
