# Cherry 消息发送测试

这个测试项目用于测试 CherryServer 和 StreamServer 的消息发送功能。

## 测试选项

### 简化测试（推荐）
只测试 StreamServer，不需要数据库：

```bash
# 1. 启动 StreamServer
.\start_streamserver_test.ps1

# 2. 运行简化测试
cd test_message_sending
cargo run simple
```

### 完整测试
测试完整的 CherryServer + StreamServer 集成：

```bash
# 1. 启动所有服务器
.\start_test_servers.ps1

# 2. 运行完整测试
cd test_message_sending
cargo run
```

## 前置要求

### 简化测试
- Rust 和 Cargo 已安装
- 端口 8080 可用

### 完整测试
- PostgreSQL 数据库运行在 `localhost:5432`
- 数据库 `cherryserver_test` 已创建
- 端口 8080 和 8181 可用

## 测试内容

### 简化测试
1. **普通消息发送**: 发送基本的文本消息
2. **事件发送**: 发送 StreamEvent 事件
3. **消息读取**: 通过 WebSocket 读取已发送的消息

### 完整测试
1. **普通消息发送**: 发送基本的文本消息
2. **回复消息发送**: 发送带回复引用的消息
3. **事件发送**: 发送 StreamEvent 事件
4. **批量消息发送**: 连续发送多个消息
5. **消息读取**: 通过 WebSocket 读取已发送的消息

## 服务器配置

- **StreamServer**: http://localhost:8080
- **CherryServer**: http://localhost:8181 (仅完整测试)
- **测试数据库**: cherryserver_test (仅完整测试)

## 故障排除

如果遇到连接问题：

1. 确保端口 8080 和 8181 是否被占用
2. 检查防火墙设置
3. 对于完整测试，确保 PostgreSQL 数据库正在运行
4. 确保测试数据库已创建

## 手动启动服务器

### 只启动 StreamServer
```bash
cd crates/streamserver
cargo run -- -c config_test.yaml
```

### 启动 CherryServer（需要数据库）
```bash
cd crates/cherryserver
cargo run -- -c config_test.yaml
``` 