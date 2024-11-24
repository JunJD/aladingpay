import 'reflect-metadata'
import { container } from 'tsyringe'
import { AlipayService } from '../services/alipay.service'
import { PAYMENT_TOKENS, PaymentProvider, IPaymentService } from '../types'
import { ConsoleLogger } from '@/app/domains/shared/logger/console.logger'
import { LOGGER_TOKEN } from '@/app/domains/shared/logger/types'

export class PaymentServiceProvider {
  static register(): void {
    // 注册日志服务
    container.register(LOGGER_TOKEN, {
      useClass: ConsoleLogger
    })

    // 注册支付宝服务
    container.register<IPaymentService>(
      PAYMENT_TOKENS.PAYMENT_SERVICE,
      {
        useClass: AlipayService
      }
    )
  }

  static getService(provider: PaymentProvider): IPaymentService {
    switch (provider) {
      case PaymentProvider.ALIPAY:
        return container.resolve<IPaymentService>(PAYMENT_TOKENS.PAYMENT_SERVICE)
      default:
        throw new Error(`Unsupported payment provider: ${provider}`)
    }
  }
} 