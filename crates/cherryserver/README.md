# CherryServer API

CherryServer 是一个基于 Rust 和 PostgreSQL 的 HTTP API 服务器，提供用户认证、好友列表和群组管理功能。

## 功能特性

- 用户登录认证
- 好友列表查询
- 群组列表查询
- PostgreSQL 数据库支持
- 异步处理，高性能

## 环境要求

- Rust 1.70+
- PostgreSQL 12+

## 配置

CherryServer 支持通过多种方式进行配置，按优先级顺序：

1. **默认值** (内置默认配置)
2. **配置文件** (`config.yaml`, `config.yml`, `config.json`, `config.toml`)
3. **环境变量** (以 `CHERRYSERVER_` 为前缀)

### 配置结构

```yaml
server:
  host: "0.0.0.0"        # 服务器绑定地址
  port: 3000             # 服务器端口

database:
  url: "postgresql://postgres:password@localhost/mydb"
  max_connections: 10    # 最大数据库连接数
  min_connections: 1     # 最小数据库连接数

jwt:
  secret: "your-secret-key-change-this-in-production"
  expiration_hours: 24   # JWT令牌过期时间(小时)

logging:
  level: "info"          # 日志级别 (debug, info, warn, error)
```

### 配置方法

#### 1. 配置文件

在项目根目录创建配置文件：

**YAML格式** (`config.yaml`):
```yaml
server:
  host: "0.0.0.0"
  port: 3000
database:
  url: "postgresql://postgres:password@localhost/mydb"
  max_connections: 10
  min_connections: 1
jwt:
  secret: "my-super-secret-jwt-key"
  expiration_hours: 24
logging:
  level: "info"
```

**JSON格式** (`config.json`):
```json
{
  "server": {
    "host": "127.0.0.1",
    "port": 8080
  },
  "database": {
    "url": "postgresql://user:pass@localhost:5432/cherryserver",
    "max_connections": 20
  },
  "jwt": {
    "secret": "production-jwt-secret-key",
    "expiration_hours": 168
  },
  "logging": {
    "level": "debug"
  }
}
```

#### 2. 环境变量

使用 `CHERRYSERVER_` 前缀和双下划线分隔嵌套值：

```bash
# 服务器配置
export CHERRYSERVER_SERVER__HOST=0.0.0.0
export CHERRYSERVER_SERVER__PORT=3000

# 数据库配置
export CHERRYSERVER_DATABASE__URL=postgresql://postgres:password@localhost/mydb
export CHERRYSERVER_DATABASE__MAX_CONNECTIONS=15
export CHERRYSERVER_DATABASE__MIN_CONNECTIONS=2

# JWT配置
export CHERRYSERVER_JWT__SECRET=my-environment-jwt-secret
export CHERRYSERVER_JWT__EXPIRATION_HOURS=48

# 日志配置
export CHERRYSERVER_LOGGING__LEVEL=warn
```

## 安装和运行

### 1. 设置数据库

首先确保 PostgreSQL 正在运行，然后创建数据库：

```sql
CREATE DATABASE mydb;
```

### 2. 配置应用

选择以下任一方式配置应用：

**方式A: 使用配置文件**
```bash
# 复制示例配置
cp config.yaml.example config.yaml
# 编辑配置文件
nano config.yaml
```

**方式B: 使用环境变量**
```bash
export CHERRYSERVER_DATABASE__URL="postgresql://postgres:password@localhost:5432/mydb"
export CHERRYSERVER_JWT__SECRET="your-production-secret-key"
```

### 3. 运行服务器

```bash
cd crates/cherryserver
cargo run
```

服务器将根据配置启动，默认在 `http://0.0.0.0:3000`。

## Docker 支持 🐳

CherryServer 提供完整的 Docker Compose 支持，可以快速启动开发或生产环境。

### 开发环境

使用 Docker 快速启动开发环境（包含 PostgreSQL 和 pgAdmin）：

```bash
# 启动开发环境
make dev-up

# 或直接使用 docker-compose
docker-compose up -d
```

服务将在以下端口启动：
- CherryServer API: http://localhost:3000
- pgAdmin: http://localhost:8080 (admin@cherryserver.com / admin123)
- PostgreSQL: localhost:5432

### 生产环境

1. 复制环境变量配置：
```bash
cp env.example .env
# 编辑 .env 文件，设置生产环境的密码和密钥
```

2. 启动生产环境：
```bash
make prod-up

# 或使用 docker-compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 常用 Docker 命令

```bash
# 查看帮助
make help

# 构建应用镜像
make build

# 查看日志
make logs

# 进入应用容器
make shell

# 连接数据库
make db-shell

# 重置数据库
make db-reset

# 停止所有服务
make down

# 清理所有容器和数据卷
make clean
```

### Docker 文件结构

```
├── Dockerfile                   # 应用镜像构建文件
├── docker-compose.yml           # 基础 Docker Compose 配置
├── docker-compose.override.yml  # 开发环境覆盖配置
├── docker-compose.prod.yml      # 生产环境配置
├── config-docker.yaml           # Docker 容器配置
├── config-prod.yaml            # 生产环境配置
├── env.example                 # 环境变量示例
├── Makefile                    # Docker 管理命令
└── docker/
    ├── init.sql               # 数据库初始化脚本
    └── dev-data.sql           # 开发环境测试数据
```

### 4. 插入测试数据

可以使用提供的 `test_data.sql` 脚本插入测试数据：

```bash
psql -d mydb -f test_data.sql
```

## API 接口

### 1. 用户登录

**POST** `/api/v1/login`

请求体：
```json
{
    "username": "admin",
    "password": "password"
}
```

响应：
```json
{
    "success": true,
    "message": "Login successful",
    "token": "jwt-token-user-1"
}
```

### 2. 获取好友列表

**GET** `/api/v1/friend/list`

**认证**: 需要Bearer token

请求头：
```
Authorization: Bearer <JWT_TOKEN>
```

响应：
```json
{
    "success": true,
    "friends": [
        {
            "id": 2,
            "name": "alice",
            "avatar": "https://example.com/avatars/alice.jpg",
            "status": "online"
        }
    ]
}
```

### 3. 获取群组列表

**GET** `/api/v1/group/list`

**认证**: 需要Bearer token

请求头：
```
Authorization: Bearer <JWT_TOKEN>
```

响应：
```json
{
    "success": true,
    "groups": [
        {
            "id": 1,
            "name": "Development Team",
            "description": "dev-team-stream-001",
            "member_count": 4
        }
    ]
}
```

### 4. 修改密码

**POST** `/api/v1/change-password`

**认证**: 需要Bearer token

请求头：
```
Authorization: Bearer <JWT_TOKEN>
```

请求体：
```json
{
    "current_password": "password",
    "new_password": "newpassword123"
}
```

响应：
```json
{
    "success": true,
    "message": "Password changed successfully"
}
```

## JWT 认证

本API使用JWT (JSON Web Token) 进行认证。

### 认证流程

1. **登录获取Token**：调用 `/api/v1/login` 接口获取JWT token
2. **使用Token访问API**：在请求头中添加 `Authorization: Bearer <token>` 访问受保护的API

### Token信息

- **有效期**: 24小时
- **格式**: JWT标准格式
- **包含信息**: 用户ID、用户名、过期时间

## 测试 API

### 使用 curl 测试

1. 测试登录获取Token：
```bash
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

2. 使用Token测试好友列表：
```bash
# 将 YOUR_JWT_TOKEN 替换为第1步获取的token
curl http://localhost:3000/api/v1/friend/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. 使用Token测试群组列表：
```bash
curl http://localhost:3000/api/v1/group/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

4. 使用Token测试修改密码：
```bash
curl -X POST http://localhost:3000/api/v1/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"current_password": "password", "new_password": "newpassword123"}'
```

### 完整测试示例

```bash
# 1. 登录并保存token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}' | \
  jq -r '.token')

# 2. 使用token访问API
curl http://localhost:3000/api/v1/friend/list \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3000/api/v1/group/list \
  -H "Authorization: Bearer $TOKEN"
```

### 测试用户账号

测试数据包含以下用户（密码使用bcrypt哈希存储）：
- `admin` / `password`
- `alice` / `password123`
- `bob` / `password123`
- `charlie` / `password123`
- `diana` / `password123`

## 数据库结构

### users 表
- `id`: 用户ID
- `name`: 用户名
- `email`: 邮箱
- `password`: 密码（使用bcrypt哈希存储）
- `avatar`: 头像URL
- `status`: 状态 (0=离线, 1=在线, 2=忙碌)

### friends 表
- `user_id`: 用户ID
- `friend_id`: 好友ID
- `status`: 关系状态 (1=已加好友)

### groups 表
- `id`: 群组ID
- `name`: 群组名称
- `stream_id`: 流ID

### group_members 表
- `group_id`: 群组ID
- `user_id`: 成员用户ID

## 注意事项

1. **安全性**：
   - 密码使用bcrypt哈希存储，符合安全最佳实践
   - JWT token用于API认证，24小时有效期
   - JWT密钥目前硬编码，生产环境应使用环境变量
2. **认证**：
   - 登录API无需认证，返回JWT token
   - 其他API需要在请求头中提供有效的JWT token
   - 用户信息从JWT token中提取，无需硬编码
3. **错误处理**：数据库错误会返回 500 状态码，认证失败返回 401 状态码。

## 开发计划

- [x] JWT 令牌认证 (24小时有效期)
- [x] 密码哈希 (使用bcrypt)
- [x] 配置管理 (支持YAML/JSON/环境变量)
- [x] JWT密钥环境变量配置
- [x] Docker Compose 支持 (开发/生产环境)
- [ ] 健康检查端点
- [ ] 更完善的错误处理
- [ ] API 文档生成
- [ ] 单元测试 