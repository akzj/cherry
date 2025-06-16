# CherryServer 快速开始指南 🚀

本指南将帮助您在几分钟内使用 Docker 启动 CherryServer。

## 📋 前提条件

- Docker Desktop（推荐）或 Docker + Docker Compose
- Git（用于克隆项目）

### 安装 Docker

#### Windows
1. 下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. 启动 Docker Desktop 并确保它正在运行

#### macOS
1. 下载并安装 [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. 启动 Docker Desktop 并确保它正在运行

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker
```

## 🚀 快速启动

### 方法 1: 使用跨平台脚本（推荐）

#### Windows (PowerShell)
```powershell
# 启动开发环境
.\docker-start.ps1

# 查看帮助
.\docker-start.ps1 help

# 停止服务
.\docker-start.ps1 stop
```

#### Linux/macOS (Bash)
```bash
# 给脚本添加执行权限
chmod +x docker-start.sh

# 启动开发环境
./docker-start.sh

# 查看帮助
./docker-start.sh help

# 停止服务
./docker-start.sh stop
```

### 方法 2: 使用 Make 命令

```bash
# 查看所有可用命令
make help

# 启动开发环境
make dev-up

# 停止服务
make dev-down

# 查看日志
make logs
```

### 方法 3: 直接使用 Docker Compose

```bash
# 启动开发环境
docker compose up -d

# 停止服务
docker compose down

# 查看日志
docker compose logs -f cherryserver
```

## 🌐 访问服务

启动成功后，您可以访问以下服务：

| 服务 | 地址 | 说明 |
|------|------|------|
| CherryServer API | http://localhost:3000 | 主要 API 服务 |
| pgAdmin | http://localhost:8080 | 数据库管理界面 |
| PostgreSQL | localhost:5432 | 数据库连接 |

### pgAdmin 登录信息
- **邮箱**: admin@cherryserver.com
- **密码**: admin123

### 测试登录账号
- **用户名**: admin
- **密码**: password123

## 🧪 测试 API

### 1. 用户登录
```bash
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

响应示例：
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2. 获取好友列表
```bash
# 使用上一步获取的 token
curl http://localhost:3000/api/v1/friend/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. 获取群组列表
```bash
curl http://localhost:3000/api/v1/group/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🏭 生产环境部署

### 1. 准备环境变量
```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件，设置生产环境配置
nano .env
```

必需的生产环境变量：
```bash
POSTGRES_PASSWORD=your-secure-password
JWT_SECRET=your-super-secure-jwt-secret
DATABASE_URL=postgresql://postgres:your-secure-password@postgres:5432/cherryserver
```

### 2. 启动生产环境

#### 使用脚本
```bash
# Windows
.\docker-start.ps1 prod

# Linux/macOS
./docker-start.sh prod
```

#### 使用 Make
```bash
make prod-up
```

#### 使用 Docker Compose
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🛠️ 常用操作

### 查看服务状态
```bash
# 使用脚本
./docker-start.sh status

# 使用 Make
make status

# 使用 Docker Compose
docker compose ps
```

### 查看日志
```bash
# 查看应用日志
make logs

# 查看所有服务日志
make logs-all

# 实时跟踪日志
docker compose logs -f cherryserver
```

### 进入容器调试
```bash
# 进入应用容器
make shell

# 连接数据库
make db-shell

# 直接使用 Docker
docker compose exec cherryserver /bin/bash
docker compose exec postgres psql -U postgres -d cherryserver
```

### 重置数据库
```bash
# 重置数据库数据
make db-reset

# 查看数据库信息
make db-info
```

### 清理环境
```bash
# 停止并移除所有容器和数据卷
make clean

# 或使用脚本
./docker-start.sh clean
```

## 🔧 自定义配置

### 开发环境配置
编辑 `config-docker.yaml` 来修改开发环境配置：

```yaml
server:
  host: "0.0.0.0"
  port: 3000

database:
  url: "postgresql://postgres:postgres123@postgres:5432/cherryserver"
  max_connections: 20

jwt:
  secret: "dev-jwt-secret"
  expiration_hours: 24

logging:
  level: "debug"
```

### 生产环境配置
编辑 `config-prod.yaml` 和 `.env` 文件来配置生产环境。

### 环境变量覆盖
您可以使用环境变量覆盖任何配置：

```bash
export CHERRYSERVER_SERVER__PORT=8000
export CHERRYSERVER_JWT__EXPIRATION_HOURS=48
export CHERRYSERVER_LOGGING__LEVEL=warn
```

## 🐛 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 检查端口占用
netstat -tulpn | grep :3000
# 或 Windows
netstat -an | findstr :3000

# 修改端口（在 docker-compose.yml 中）
ports:
  - "8080:3000"  # 使用 8080 端口
```

#### 2. 数据库连接失败
```bash
# 检查数据库容器状态
docker compose ps postgres

# 查看数据库日志
docker compose logs postgres

# 重启数据库
docker compose restart postgres
```

#### 3. 容器构建失败
```bash
# 清理并重新构建
docker compose down
docker compose build --no-cache cherryserver
docker compose up -d
```

#### 4. 权限问题（Linux/macOS）
```bash
# 确保脚本有执行权限
chmod +x docker-start.sh

# 如果需要，将用户添加到 docker 组
sudo usermod -aG docker $USER
# 然后重新登录
```

## 📚 更多资源

- [完整配置文档](crates/cherryserver/README.md)
- [Docker 支持详情](DOCKER_SUPPORT.md)
- [配置管理详情](CONFIGURATION_REFACTOR.md)
- [API 文档](crates/cherryserver/README.md#api-接口)

## 🎉 恭喜！

您现在已经成功启动了 CherryServer！开始享受开发吧！🚀 