#!/bin/bash
# 更新 .env 文件以支持 Docker 环境

ENV_FILE=".env"

# 检查 .env 文件是否存在
if [ ! -f "$ENV_FILE" ]; then
    echo "创建 .env 文件..."
    cp env_example.txt .env
fi

# 更新环境变量
echo "更新 .env 文件中的配置..."

# 设置 DJANGO_ENVIRONMENT 为 docker
sed -i 's/^DJANGO_ENVIRONMENT=.*/DJANGO_ENVIRONMENT=docker/' $ENV_FILE

# 设置 BITBROWSER_API_URL 为 host.docker.internal
sed -i 's|^BITBROWSER_API_URL=.*|BITBROWSER_API_URL=http://host.docker.internal:54345|' $ENV_FILE

echo "✅ .env 文件已更新!"
echo ""
echo "当前配置:"
grep -E "^(DJANGO_ENVIRONMENT|BITBROWSER_API_URL)=" $ENV_FILE

