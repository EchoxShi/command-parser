# nlc - Natural Language Command

用自然语言描述你想做什么，`nlc` 帮你生成对应的终端命令。

支持 **Windows / macOS / Linux**。

## 安装

```bash
npm install -g nlc-cli
```

## 快速开始

```bash
# 1. 配置 API Key (通义千问，免费)
nlc config --set-key <your-api-key>

# 2. 开始使用
nlc "列出当前目录的文件"
nlc "查找大于100MB的文件"
nlc "删除所有node_modules文件夹"
```

## 交互操作

生成命令后，按快捷键操作：
- **C** - 复制到剪贴板
- **X** - 执行命令
- **Enter** - 退出

## 使用示例

```bash
# 基本用法
nlc "显示磁盘使用情况"
nlc "查找包含error的日志文件"
nlc "压缩当前目录为zip"

# 指定 shell 类型
nlc "删除所有临时文件" -s bash      # macOS/Linux
nlc "列出所有进程" -s powershell    # Windows

# 跳过交互，直接显示命令
nlc "查看网络连接" -y
```

## 配置

```bash
# 查看当前配置
nlc config --show

# 设置 API Key
nlc config --set-key <key>

# 设置自定义 API 地址 (可选)
nlc config --set-url <url>

# 设置模型 (可选)
nlc config --set-model <model>

# 清除所有配置
nlc config --clear
```

## 支持的 Shell

| Shell | 平台 | 选项 |
|-------|------|------|
| PowerShell | Windows (默认) | `-s powershell` |
| CMD | Windows | `-s cmd` |
| Bash | macOS/Linux | `-s bash` |

## 获取 API Key

默认使用阿里通义千问 API（免费额度大，国内访问快）：

1. 访问 [阿里云百炼平台](https://bailian.console.aliyun.com/)
2. 用支付宝/淘宝账号登录
3. 点击右上角头像 → 「API-KEY」
4. 点击「创建新的API-KEY」
5. 复制 Key，运行：
   ```bash
   nlc config --set-key sk-xxxxxxxxxxxxxxxx
   ```

> 免费额度：每月 100 万 tokens，足够日常使用

## 使用其他 API

支持任何兼容 OpenAI 格式的 API：

```bash
# DeepSeek
nlc config --set-url https://api.deepseek.com/v1
nlc config --set-model deepseek-chat
nlc config --set-key <your-deepseek-key>

# OpenAI
nlc config --set-url https://api.openai.com/v1
nlc config --set-model gpt-4o-mini
nlc config --set-key <your-openai-key>
```

## 安全提示

- 危险命令（如删除、格式化）会显示警告
- 执行前需要按 X 确认
- 危险命令执行前还需要再按 Y 二次确认

## License

MIT
