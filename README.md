# StreamStore-RS 🚀

高性能流式数据存储和 HTTP API 服务的 Rust 实现。

## 📦 项目结构

此工作空间包含两个主要组件：

### 🍒 [CherryServer](crates/cherryserver/)
基于 Rust 的 HTTP API 服务器，提供：
- JWT 认证系统
- 用户好友管理
- 群组管理
- PostgreSQL 数据库支持
- Docker Compose 部署支持

### 📡 [StreamStore](crates/streamstore/)
高性能流式数据存储引擎

## 🐳 快速开始（Docker）

使用 Docker 快速启动 CherryServer：

```bash
# Windows
.\docker-start.ps1

# Linux/macOS
chmod +x docker-start.sh
./docker-start.sh

# 或使用 Make
make dev-up
```

服务将在以下地址启动：
- **API 服务**: http://localhost:3000
- **数据库管理**: http://localhost:8080 (pgAdmin)

## 📚 文档

- [CherryServer 详细文档](crates/cherryserver/README.md)
- [快速开始指南](QUICK_START.md)
- [Docker 支持详情](DOCKER_SUPPORT.md)
- [配置管理](CONFIGURATION_REFACTOR.md)

## 🛠️ 开发

### 构建项目
```bash
# 构建所有组件
cargo build

# 构建特定组件
cargo build -p cherryserver
cargo build -p streamstore
```

### 运行测试
```bash
# 运行所有测试
cargo test

# 运行特定组件测试
cargo test -p cherryserver
```

### 开发环境（Docker）
```bash
# 启动开发环境
make dev-up

# 查看日志
make logs

# 进入容器调试
make shell

# 停止环境
make dev-down
```

## 🔧 配置

CherryServer 支持多种配置方式：

1. **配置文件**: `config.yaml`, `config.json`
2. **环境变量**: `CHERRYSERVER_*` 前缀
3. **Docker 环境**: 预配置的容器环境

详见 [配置文档](CONFIGURATION_REFACTOR.md)。

## 🚀 生产部署

### Docker Compose（推荐）
```bash
# 1. 配置环境变量
cp env.example .env
# 编辑 .env 设置生产配置

# 2. 启动生产环境
make prod-up
```

### 手动部署
```bash
# 1. 构建发布版本
cargo build --release -p cherryserver

# 2. 配置数据库
export CHERRYSERVER_DATABASE__URL="your-postgres-url"

# 3. 运行服务
./target/release/cherryserver
```

## 🎯 功能特性

### CherryServer
- ✅ JWT 令牌认证 (24小时有效期)
- ✅ 密码哈希 (使用bcrypt)
- ✅ 配置管理 (支持YAML/JSON/环境变量)
- ✅ Docker Compose 支持 (开发/生产环境)
- ✅ RESTful API 设计
- ✅ PostgreSQL 数据库支持
- ✅ 异步处理，高性能

### StreamStore
- 📡 高性能流式数据存储
- 🔄 Write-Ahead Log (WAL) 支持
- 📊 内存表和段存储
- ⚡ 异步 I/O 操作

## 🧪 API 测试

### 登录并获取 Token
```bash
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

### 访问受保护的 API
```bash
curl http://localhost:3000/api/v1/friend/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔐 安全特性

- **密码加密**: 使用 bcrypt 哈希
- **JWT 认证**: 无状态令牌认证
- **环境配置**: 敏感信息通过环境变量配置
- **容器安全**: 非 root 用户运行

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 [LICENSE](LICENSE) 许可证。

## 🏗️ 架构概览

```
streamstore-rs/
├── crates/
│   ├── cherryserver/     # HTTP API 服务器
│   │   ├── src/
│   │   │   ├── api/      # API 路由和处理器
│   │   │   ├── auth/     # JWT 认证系统
│   │   │   ├── config/   # 配置管理
│   │   │   └── db/       # 数据库操作
│   │   └── Dockerfile
│   └── streamstore/      # 流式存储引擎
├── docker-compose.yml    # Docker 编排
├── Makefile             # 便捷命令
└── README.md           # 本文件
```

---

**🎉 开始您的开发之旅！**

查看 [快速开始指南](QUICK_START.md) 了解详细的安装和使用说明。 