# Alading Pay - 支付集成系统

基于 Next.js 14 开发的支付集成系统，采用领域驱动设计(DDD)思想，目前支持支付宝当面付。

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- tsyringe (依赖注入)
- Zod (运行时类型验证)
- Winston (日志系统)

## 项目结构

```
app/
  ├── domains/              # 领域模型
  │   ├── payment/         # 支付领域
  │   │   ├── services/    # 支付服务实现
  │   │   ├── providers/   # 服务提供者
  │   │   └── types.ts     # 类型定义
  │   └── shared/          # 共享模块
  │       └── logger/      # 日志服务
  ├── api/                 # API 路由
  │   └── payment/        # 支付相关接口
  └── payment/            # 支付页面
      ├── page.tsx        # 支付主页面
      ├── success/        # 支付成功页
      └── failed/         # 支付失败页
```

## 开发历程

### 第一阶段：基础架构搭建

1. 采用 DDD 思想设计项目结构
2. 使用 tsyringe 实现依赖注入
3. 使用 Zod 进行运行时类型验证
4. 实现基础日志系统

关键决策：
- 选择 DDD 来处理复杂的支付业务逻辑
- 使用依赖注入提高代码可测试性和可维护性
- 使用 Zod 确保运行时类型安全

### 第二阶段：支付宝集成

1. 实现支付宝当面付接口
2. 处理二维码生成和展示
3. 实现订单状态查询
4. 添加订单撤销功能

关键决策：
- 使用轮询而不是 WebSocket 查询支付状态
- 使用 useRef 而不是 useState 管理轮询状态
- 添加倒计时和自动撤销功能

### 第三阶段：用户体验优化

1. 添加支付倒计时
2. 实现订单撤销功能
3. 优化错误处理
4. 添加加载状态提示

关键决策：
- 使用 useRef 避免轮询状态更新的竞态条件
- 实现优雅的错误处理和用户提示
- 添加支付结果页面

## ��键技术点

### 依赖注入
使用 tsyringe 实现依赖注入，使代码更易测试和维护：
```typescript
@injectable()
export class AlipayService implements IPaymentService {
  constructor(@inject(LOGGER_TOKEN) private logger: ILogger) {}
}
```

### 状态管理
使用 useRef 管理轮询状态，避免状态更新问题：
```typescript
const pollingRef = useRef(false);
// 而不是
// const [polling, setPolling] = useState(false);
```

### 错误处理
统一的错误处理和日志记录：
```typescript
try {
  // 业务逻辑
} catch (error) {
  logger.error('操作失败:', error);
  return {
    success: false,
    errorMessage: error instanceof Error ? error.message : '未知错误'
  };
}
```

## 待优化点

1. 添加单元测试
2. 实现更多支付方式
3. 添加支付通知处理
4. 优化移动端体验
5. 添加支付统计和分析
6. 实现订单管理功能

## 本地开发

1. 安装依赖：
```bash
pnpm install
```

2. 配置环境变量：
```bash
cp .env.example .env.local
# 编辑 .env.local 添加支付宝配置
```

3. 启动开发服务器：
```bash
pnpm dev
```

## 部署

1. 构建项目：
```bash
pnpm build
```

2. 启动生产服务器：
```bash
pnpm start
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支
3. 提���代码
4. 创建 Pull Request

## 许可证

MIT
