import { z } from 'zod'

// 注入标识符
export const PAYMENT_TOKENS = {
  PAYMENT_SERVICE: Symbol('PAYMENT_SERVICE'),
}

// 支付方式枚举
export enum PaymentProvider {
  ALIPAY = 'ALIPAY',
  // 未来可以扩展其他支付方式
}

// 支付状态枚举
export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

// 支付宝交易状态枚举
export enum AlipayTradeStatus {
  WAIT_BUYER_PAY = 'WAIT_BUYER_PAY',  // 交易创建，等待买家付款
  TRADE_CLOSED = 'TRADE_CLOSED',      // 未付款交易超时关闭，或支付完成后全额退款
  TRADE_SUCCESS = 'TRADE_SUCCESS',     // 交易支付成功
  TRADE_FINISHED = 'TRADE_FINISHED'    // 交易结束，不可退款
}

// 支付宝错误码
export enum AlipayErrorCode {
  SUCCESS = '10000',
  BUSINESS_FAILED = '40004',
  // ... 可以添加其他错误码
}

// 支付宝交易动作枚举
export enum AlipayTradeAction {
  CLOSE = 'close',    // 交易未支付，触发关闭交易动作，无退款
  REFUND = 'refund',  // 交易已支付，触发交易退款动作
}

// 支付订单验证schema
export const PaymentOrderSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  subject: z.string(),
  provider: z.nativeEnum(PaymentProvider),
})

export type PaymentOrder = z.infer<typeof PaymentOrderSchema>

// 支付结果验证schema
export const PaymentResultSchema = z.object({
  success: z.boolean(),
  orderId: z.string(),
  tradeNo: z.string().optional(),
  errorMessage: z.string().optional(),
  status: z.nativeEnum(PaymentStatus),
  qrCode: z.string().optional(),
  traceId: z.string().optional(),
  subCode: z.string().optional(),
  subMsg: z.string().optional(),
  action: z.nativeEnum(AlipayTradeAction).optional(),
})

export type PaymentResult = z.infer<typeof PaymentResultSchema>

// 支付服务接口
export interface IPaymentService {
  createOrder(order: PaymentOrder): Promise<PaymentResult>
  queryOrder(orderId: string): Promise<PaymentResult>
  cancelOrder(orderId: string): Promise<PaymentResult>
  handleNotify(notifyData: Record<string, string>): Promise<boolean>
} 