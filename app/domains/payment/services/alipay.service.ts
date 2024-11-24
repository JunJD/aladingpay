import { AlipaySdk } from 'alipay-sdk'
import { injectable, inject } from 'tsyringe'
import { 
  IPaymentService, 
  PaymentOrder, 
  PaymentResult, 
  PaymentStatus,
  AlipayTradeStatus,
  AlipayErrorCode 
} from '../types'
import { LOGGER_TOKEN } from '@/app/domains/shared/logger/types'
import type { ILogger } from '@/app/domains/shared/logger/types'

@injectable()
export class AlipayService implements IPaymentService {
  private sdk: AlipaySdk

  constructor(
    @inject(LOGGER_TOKEN) private logger: ILogger
  ) {
    this.sdk = new AlipaySdk({
      appId: process.env.ALIPAY_APP_ID!,
      privateKey: process.env.ALIPAY_PRIVATE_KEY!,
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
      gateway: process.env.GATEWAY!,
    })
  }

  private mapAlipayStatus(status?: string): PaymentStatus {
    switch (status) {
      case AlipayTradeStatus.TRADE_SUCCESS:
      case AlipayTradeStatus.TRADE_FINISHED:
        return PaymentStatus.SUCCESS
      case AlipayTradeStatus.TRADE_CLOSED:
        return PaymentStatus.FAILED
      case AlipayTradeStatus.WAIT_BUYER_PAY:
      default:
        return PaymentStatus.PENDING
    }
  }

  async createOrder(order: PaymentOrder): Promise<PaymentResult> {
    try {
      this.logger.info('创建支付宝订单', order);

      const result = await this.sdk.exec('alipay.trade.precreate', {
        bizContent: {
          out_trade_no: order.orderId,
          total_amount: order.amount,
          subject: order.subject,
        },
      })

      this.logger.info('支付宝创建订单响应:', result);

      if (result.code !== AlipayErrorCode.SUCCESS) {
        return {
          success: false,
          orderId: order.orderId,
          errorMessage: result.subMsg || result.msg || '支付宝接口调用失败',
          status: PaymentStatus.FAILED,
          subCode: result.subCode,
          subMsg: result.subMsg,
          traceId: result.traceId,
        }
      }

      return {
        success: true,
        orderId: result.outTradeNo || order.orderId,
        status: PaymentStatus.PENDING,
        qrCode: result.qrCode,
        traceId: result.traceId,
      }
    } catch (error) {
      this.logger.error('创建支付宝订单失败:', error);
      return {
        success: false,
        orderId: order.orderId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        status: PaymentStatus.FAILED,
      }
    }
  }

  async queryOrder(orderId: string): Promise<PaymentResult> {
    try {
      this.logger.info('查询支付宝订单状态:', orderId);

      const result = await this.sdk.exec('alipay.trade.query', {
        bizContent: {
          out_trade_no: orderId,
        },
      })

      this.logger.info('支付宝查询订单响应:', result);

      // 交易不存在的特殊处理
      if (result.code === AlipayErrorCode.BUSINESS_FAILED && 
          result.subCode === 'ACQ.TRADE_NOT_EXIST') {
        return {
          success: false,
          orderId: orderId,
          status: PaymentStatus.PENDING,
          errorMessage: result.subMsg,
          subCode: result.subCode,
          subMsg: result.subMsg,
          traceId: result.traceId,
        }
      }

      if (result.code !== AlipayErrorCode.SUCCESS) {
        return {
          success: false,
          orderId: orderId,
          errorMessage: result.subMsg || result.msg || '支付宝接口调用失败',
          status: PaymentStatus.FAILED,
          subCode: result.subCode,
          subMsg: result.subMsg,
          traceId: result.traceId,
        }
      }

      return {
        success: true,
        orderId: orderId,
        tradeNo: result.tradeNo,
        status: this.mapAlipayStatus(result.tradeStatus),
        traceId: result.traceId,
      }
    } catch (error) {
      this.logger.error('查询支付宝订单失败:', error);
      return {
        success: false,
        orderId: orderId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        status: PaymentStatus.FAILED,
      }
    }
  }

  async handleNotify(notifyData: Record<string, string>): Promise<boolean> {
    try {
      this.logger.info('收到支付宝异步通知:', notifyData);

      const signValid = this.sdk.checkNotifySign(notifyData)
      if (!signValid) {
        this.logger.error('支付宝异步通知签名验证失败');
        throw new Error('支付宝异步通知签名验证失败')
      }

      const tradeStatus = notifyData.trade_status
      if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
        this.logger.info('支付成功，订单号:', notifyData.out_trade_no);
        return true
      }

      return false
    } catch (error) {
      this.logger.error('处理支付宝异步通知失败:', error);
      throw error
    }
  }

  async cancelOrder(orderId: string): Promise<PaymentResult> {
    try {
      this.logger.info('撤销支付宝订单:', orderId);

      const result = await this.sdk.exec('alipay.trade.cancel', {
        bizContent: {
          out_trade_no: orderId,
        },
      })

      this.logger.info('支付宝撤销订单响应:', result);

      if (result.code !== AlipayErrorCode.SUCCESS) {
        return {
          success: false,
          orderId: orderId,
          errorMessage: result.subMsg || result.msg || '支付宝接口调用失败',
          status: PaymentStatus.FAILED,
          subCode: result.subCode,
          subMsg: result.subMsg,
          traceId: result.traceId,
        }
      }

      return {
        success: true,
        orderId: orderId,
        status: PaymentStatus.FAILED, // 撤销成功后状态设为失败
        action: result.action,
        traceId: result.traceId,
      }
    } catch (error) {
      this.logger.error('撤销支付宝订单失败:', error);
      return {
        success: false,
        orderId: orderId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        status: PaymentStatus.FAILED,
      }
    }
  }
} 