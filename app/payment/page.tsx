'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { PaymentProvider, PaymentStatus } from '@/app/domains/payment/types'
import { useRouter } from 'next/navigation'
import { usePolling } from '@/lib/hooks/usePolling'
import { formatTime } from '@/lib/utils/format'
import { PAYMENT_CONSTANTS, PAYMENT_MESSAGES } from '@/lib/constants/payment'

export default function PaymentPage() {
  const [orderId, setOrderId] = useState('')
  const [amount, setAmount] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const router = useRouter()

  // 查询支付状态的函数
  const queryPaymentStatus = async (orderId: string) => {
    const response = await fetch(
      `/api/payment?orderId=${orderId}&provider=${PaymentProvider.ALIPAY}`
    )
    const result = await response.json()
    return result
  }

  // 处理超时的函数
  const handleTimeout = async () => {
    if (qrCode) {
      await handleCancel()
    }
  }

  const {
    start: startPolling,
    stop: stopPolling,
    querying,
    countdown,
    setCountdown,
  } = usePolling(
    async () => {
      const result = await queryPaymentStatus(orderId)
      if (result.status === PaymentStatus.SUCCESS) {
        router.push(`/payment/success?orderId=${orderId}`)
        return true
      }
      return false
    },
    {
      timeout: PAYMENT_CONSTANTS.TIMEOUT,
      interval: PAYMENT_CONSTANTS.POLLING_INTERVAL,
      onTimeout: handleTimeout
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setQrCode(null)
    setCountdown(PAYMENT_CONSTANTS.TIMEOUT)

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount: Number(amount),
          subject,
          provider: PaymentProvider.ALIPAY,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setQrCode(result.qrCode)
        startPolling()
      } else {
        setError(result.errorMessage || PAYMENT_MESSAGES.CREATE_FAILED)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : PAYMENT_MESSAGES.CREATE_FAILED)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!orderId) return

    try {
      setLoading(true)
      stopPolling()
      const response = await fetch(`/api/payment/${orderId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        setQrCode(null)
        setCountdown(0)
        router.push(`/payment/failed?orderId=${orderId}&error=${PAYMENT_MESSAGES.CANCEL_SUCCESS}`)
      } else {
        setError(result.errorMessage || PAYMENT_MESSAGES.CANCEL_FAILED)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : PAYMENT_MESSAGES.CANCEL_FAILED)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
            支付订单
          </h1>
          
          {!qrCode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  订单号
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  金额 (元)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">¥</span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">CNY</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品名称
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    处理中...
                  </div>
                ) : '确认支付'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-lg shadow-lg">
                  <QRCodeSVG value={qrCode} size={256} />
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-lg font-semibold text-gray-900">
                  支付倒计时：{formatTime(countdown)}
                </div>
                {querying && (
                  <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    正在查询支付结果...
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mb-6">
                请使用支付宝扫描二维码完成支付
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '处理中...' : '取消支付'}
                </button>
                
                <button
                  onClick={() => setQrCode(null)}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  返回修改
                </button>
              </div>
            </div>
          )}
          
          {error && !qrCode && (
            <div className="mt-4 text-sm text-red-600 text-center">{error}</div>
          )}
        </div>
      </div>
    </div>
  )
} 