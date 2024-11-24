'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            支付失败
          </h1>
          <div className="text-gray-600 mb-8">
            <p className="mb-2">订单号: {orderId}</p>
            {error && <p className="text-red-500">错误信息: {error}</p>}
          </div>
          <div className="space-y-4">
            <Link
              href={`/payment?orderId=${orderId}`}
              className="block w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              重新支付
            </Link>
            <Link
              href="/"
              className="block w-full text-blue-500 hover:text-blue-600 transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 