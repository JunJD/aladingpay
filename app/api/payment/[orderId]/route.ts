import 'reflect-metadata'
import { NextResponse } from 'next/server'
import { PaymentServiceProvider } from '@/app/domains/payment/providers/payment.provider'
import { PaymentProvider } from '@/app/domains/payment/types'

// 注册支付服务
PaymentServiceProvider.register()

export async function DELETE(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId
    const paymentService = PaymentServiceProvider.getService(PaymentProvider.ALIPAY)
    const result = await paymentService.cancelOrder(orderId)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('撤销支付订单失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '撤销支付订单失败' 
      },
      { status: 400 }
    )
  }
} 