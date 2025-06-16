# Docker Compose 支持完成 🐳

本次更新为 CherryServer 添加了完整的 Docker Compose 支持，包括开发和生产环境配置。

## 🎯 添加的文件

### 核心 Docker 文件
- `Dockerfile` - 多阶段构建的应用镜像
- `docker-compose.yml` - 基础 Docker Compose 配置
- `.dockerignore` - Docker 构建优化文件

### 环境特定配置
- `docker-compose.override.yml` - 开发环境覆盖配置（自动生效）
- `docker-compose.prod.yml` - 生产环境配置
- `config-docker.yaml` - Docker 容器专用配置
- `config-prod.yaml` - 生产环境配置

### 数据库和初始化
- `docker/init.sql` - 数据库表结构和基础数据
- `docker/dev-data.sql` - 开发环境额外测试数据

### 管理工具
- `Makefile` - Docker 操作的便捷命令
- `env.example` - 环境变量配置示例

## 🚀 功能特性

### 开发环境
- **完整服务栈**: CherryServer + PostgreSQL + pgAdmin
- **自动数据库初始化**: 包含表结构和测试数据
- **调试友好**: debug 日志级别和错误堆栈跟踪
- **端口暴露**: 所有服务端口对外可访问
- **数据持久化**: PostgreSQL 数据卷持久化

### 生产环境
- **安全优化**: 数据库端口不对外暴露
- **资源限制**: CPU 和内存资源约束
- **环境变量**: 敏感配置通过环境变量
- **性能调优**: PostgreSQL 参数优化
- **健康检查**: 容器健康状态监控

### 服务组件

#### 1. CherryServer 应用
```yaml
- 镜像: 自定义构建 (Rust + Debian)
- 端口: 3000
- 配置: 支持环境变量覆盖
- 用户: 非 root 用户运行
```

#### 2. PostgreSQL 数据库
```yaml
- 镜像: postgres:15-alpine
- 端口: 5432 (仅开发环境暴露)
- 数据: 持久化存储
- 初始化: 自动创建表和测试数据
```

#### 3. pgAdmin (可选)
```yaml
- 镜像: dpage/pgadmin4
- 端口: 8080
- 认证: admin@cherryserver.com / admin123
- 环境: 仅开发环境启用
```

## 🛠️ 使用方法

### 快速开始

1. **开发环境**:
```bash
make dev-up
# 访问 http://localhost:3000
```

2. **生产环境**:
```bash
cp env.example .env
# 编辑 .env 设置密码
make prod-up
```

### 管理命令

```bash
# 查看所有可用命令
make help

# 构建应用镜像
make build

# 查看应用日志
make logs

# 进入容器调试
make shell

# 数据库管理
make db-shell
make db-reset

# 清理环境
make clean
```

## 🔧 配置系统集成

Docker 环境完美集成了配置管理系统：

### 配置优先级
1. **环境变量** (Docker Compose 设置)
2. **配置文件** (容器内 config.yaml)
3. **默认值** (应用内置)

### 环境变量映射
```bash
# 服务器配置
CHERRYSERVER_SERVER__HOST=0.0.0.0
CHERRYSERVER_SERVER__PORT=3000

# 数据库配置
CHERRYSERVER_DATABASE__URL=postgresql://...
CHERRYSERVER_DATABASE__MAX_CONNECTIONS=20

# JWT 配置
CHERRYSERVER_JWT__SECRET=your-secret
CHERRYSERVER_JWT__EXPIRATION_HOURS=24

# 日志配置
CHERRYSERVER_LOGGING__LEVEL=info
```

## 📊 环境对比

| 特性 | 开发环境 | 生产环境 |
|------|----------|----------|
| pgAdmin | ✅ 启用 | ❌ 禁用 |
| 数据库端口 | ✅ 暴露 5432 | ❌ 内部访问 |
| 日志级别 | debug | warn |
| 资源限制 | ❌ 无限制 | ✅ CPU/内存限制 |
| 测试数据 | ✅ 包含额外数据 | ❌ 仅基础数据 |
| 健康检查 | ❌ 未启用 | ✅ 启用 |

## 🔐 安全考虑

### 开发环境
- 使用默认密码（仅限开发）
- 暴露数据库端口便于调试
- 包含 pgAdmin 管理界面

### 生产环境
- 强制使用环境变量密码
- 数据库仅内部访问
- 移除管理界面
- 非 root 用户运行
- 资源限制防止滥用

## 🎭 测试账号

开发环境包含以下测试账号（密码均为 `password123`）：

- `admin` - 管理员账号
- `alice` - 普通用户
- `bob` - 普通用户  
- `charlie` - 普通用户
- `diana` - 普通用户
- `testuser1` / `testuser2` / `devuser` - 额外测试账号

## 📋 部署清单

### 开发环境部署
- [x] Docker Compose 基础配置
- [x] 开发环境覆盖配置
- [x] 数据库自动初始化
- [x] pgAdmin 管理界面
- [x] 测试数据自动加载

### 生产环境部署
- [x] 生产环境专用配置
- [x] 环境变量安全配置
- [x] 资源限制和优化
- [x] 健康检查配置
- [x] 数据持久化设置

### 管理工具
- [x] Makefile 便捷命令
- [x] 环境变量示例文件
- [x] Docker 构建优化
- [x] 详细使用文档

## 🚢 部署优势

1. **开发体验**: 一键启动完整开发环境
2. **环境一致性**: 开发和生产环境配置统一
3. **快速部署**: 生产环境零配置部署
4. **易于维护**: 版本化容器和配置管理
5. **扩展性**: 支持多实例和负载均衡
6. **监控友好**: 健康检查和日志聚合

Docker Compose 支持的添加使 CherryServer 从开发到生产的整个流程变得更加顺畅和可靠！ 