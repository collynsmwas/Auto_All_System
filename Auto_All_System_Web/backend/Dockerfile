FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    DJANGO_ENVIRONMENT=production

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements/ requirements/

# 安装 Python 依赖
RUN pip install --upgrade pip && \
    pip install -r requirements/base.txt

# 复制项目文件
COPY . .

# 复制并设置启动脚本权限
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# 创建静态文件和日志目录
RUN mkdir -p staticfiles media /var/log/auto_all_system

# 暴露端口
EXPOSE 8000

# 设置入口点
ENTRYPOINT ["docker-entrypoint.sh"]

# 启动命令（默认，可被 docker-compose 覆盖）
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]

