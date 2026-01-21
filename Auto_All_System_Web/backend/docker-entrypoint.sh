#!/bin/bash

# 等待数据库服务就绪
echo "Waiting for PostgreSQL..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done
echo "PostgreSQL started"

# 等待Redis服务就绪
echo "Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 0.1
done
echo "Redis started"

# 运行数据库迁移
echo "Running database migrations..."
python manage.py migrate --noinput

# 创建超级用户（如果不存在）
echo "Creating superuser if not exists..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created')
else:
    print('Superuser already exists')
END

# 初始化插件系统
echo "Initializing plugin system..."
python init_plugins.py

# 初始化系统数据
echo "Initializing system data..."
python init_system.py

# 收集静态文件
echo "Collecting static files..."
python manage.py collectstatic --noinput

# 启动应用
echo "Starting application..."
exec "$@"

