export const PAYMENT_CONSTANTS = {
  TIMEOUT: 120, // 支付超时时间（秒）
  POLLING_INTERVAL: 3000, // 轮询间隔（毫秒）
  MAX_AMOUNT: 100000000, // 最大支付金额
  MIN_AMOUNT: 0.01, // 最小支付金额
}

export const PAYMENT_MESSAGES = {
  CREATE_SUCCESS: '支付订单创建成功',
  CREATE_FAILED: '支付订单创建失败',
  QUERY_FAILED: '查询支付状态失败',
  CANCEL_SUCCESS: '支付已取消',
  CANCEL_FAILED: '取消支付失败',
  TIMEOUT: '支付超时',
} 