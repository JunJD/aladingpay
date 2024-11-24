import { container } from 'tsyringe'
import { AlipayService } from './services/alipay.service'
import { PaymentProvider, IPaymentService } from './types'
import { LOGGER_TOKEN } from '../shared/logger/types'

export class PaymentContainer {
  private static instance: PaymentContainer
  private services: Map<PaymentProvider, IPaymentService>

  private constructor() {
    this.services = new Map()
    this.services.set(PaymentProvider.ALIPAY, new AlipayService(container.resolve(LOGGER_TOKEN)))
  }

  static getInstance(): PaymentContainer {
    if (!PaymentContainer.instance) {
      PaymentContainer.instance = new PaymentContainer()
    }
    return PaymentContainer.instance
  }

  getService(provider: PaymentProvider): IPaymentService {
    const service = this.services.get(provider)
    if (!service) {
      throw new Error(`Payment service for provider ${provider} not found`)
    }
    return service
  }
} 