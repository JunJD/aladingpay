import 'reflect-metadata'
import { NextResponse } from 'next/server'
import { PaymentServiceProvider } from '@/app/domains/payment/providers/payment.provider'
import { PaymentOrderSchema, PaymentProvider } from '@/app/domains/payment/types'

// 注册支付服务
PaymentServiceProvider.register()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const paymentOrder = PaymentOrderSchema.parse(body)
    
    const paymentService = PaymentServiceProvider.getService(paymentOrder.provider)
    const result = await paymentService.createOrder(paymentOrder)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('创建支付订单失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '创建支付订单失败' 
      },
      { status: 400 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const provider = searchParams.get('provider') as PaymentProvider

    if (!orderId || !provider) {
      throw new Error('缺少订单号或支付提供商信息')
    }

    const paymentService = PaymentServiceProvider.getService(provider)
    const result = await paymentService.queryOrder(orderId)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('查询支付订单失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '查询支付订单失败' 
      },
      { status: 400 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.formData()
    const paymentService = PaymentServiceProvider.getService(PaymentProvider.ALIPAY)
    
    const notifyData: Record<string, string> = {}
    body.forEach((value, key) => {
      notifyData[key] = value.toString()
    })

    await paymentService.handleNotify(notifyData)
    return new NextResponse('success', { status: 200 })
  } catch (error) {
    console.error('处理支付通知失败:', error)
    return new NextResponse('fail', { status: 400 })
  }
} 