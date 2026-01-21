@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ╔═══════════════════════════════════════════════════════════╗
echo ║        Auto_All_System - 一键启动脚本                     ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM 设置PostgreSQL环境变量（使用UTF-8）
set PGCLIENTENCODING=UTF8

cd /d "%~dp0Auto_All_System\backend"

echo [1/5] 检查虚拟环境...
if not exist "venv\" (
    echo ⚠ 虚拟环境不存在，正在创建...
    python -m venv venv
    echo ✓ 虚拟环境创建成功
) else (
    echo ✓ 虚拟环境已存在
)

echo.
echo [2/5] 激活虚拟环境...
call venv\Scripts\activate.bat

echo.
echo [3/5] 检查依赖...
pip show django >nul 2>&1
if errorlevel 1 (
    echo ⚠ 依赖未安装，正在安装...
    pip install -r requirements\development.txt
) else (
    echo ✓ 依赖已安装
)

echo.
echo [4/5] 检查环境配置...
if not exist ".env" (
    echo ⚠ .env文件不存在，正在创建...
    copy env_example.txt .env >nul
    echo ✓ 已创建.env文件（请检查数据库配置）
    echo.
    echo ⚠ 请编辑 .env 文件配置数据库密码：
    echo    DB_PASSWORD=你的数据库密码
    echo.
    pause
) else (
    echo ✓ .env文件已存在
)

echo.
echo [5/5] 检查数据库...
echo.
echo 正在检查数据库是否存在...

REM 使用UTF-8客户端编码检查数据库
psql -U postgres --set=client_encoding=UTF8 -lqt | findstr /C:"auto_all_system" >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠ 数据库不存在，是否立即创建？
    echo.
    echo 选择创建方式：
    echo   [1] 自动创建（推荐）
    echo   [2] 使用 pgAdmin 手动创建
    echo   [0] 退出
    echo.
    set /p choice="请选择 [1/2/0]: "
    
    if "!choice!"=="1" (
        echo.
        echo 正在创建数据库（使用UTF8编码）...
        psql -U postgres --set=client_encoding=UTF8 -c "CREATE DATABASE auto_all_system WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE=template0;"
        if errorlevel 1 (
            echo.
            echo ❌ 数据库创建失败！
            echo.
            echo 📌 请手动使用 pgAdmin 创建：
            echo    1. 打开 pgAdmin 4
            echo    2. 右键 Databases → Create → Database
            echo    3. Name: auto_all_system
            echo    4. Encoding: UTF8
            echo    5. Save
            echo.
            pause
            exit /b 1
        ) else (
            echo ✓ 数据库创建成功
        )
    ) else if "!choice!"=="2" (
        echo.
        echo 📌 请使用 pgAdmin 创建数据库：
        echo    1. 打开 pgAdmin 4
        echo    2. 右键 Databases → Create → Database
        echo    3. Name: auto_all_system
        echo    4. Encoding: UTF8
        echo    5. Save
        echo.
        echo 创建完成后按任意键继续...
        pause >nul
    ) else (
        echo 已退出
        exit /b 0
    )
) else (
    echo ✓ 数据库已存在
)

echo.
echo ═══════════════════════════════════════════════════════════
echo 是否执行数据库迁移？[Y/N]
echo ═══════════════════════════════════════════════════════════
set /p migrate="请选择: "

if /i "!migrate!"=="Y" (
    echo.
    echo 正在执行迁移...
    python manage.py makemigrations
    python manage.py migrate
    echo.
    echo ✓ 迁移完成
    echo.
    echo 是否创建管理员账号？[Y/N]
    set /p create_user="请选择: "
    if /i "!create_user!"=="Y" (
        echo.
        echo 提示：使用默认账号 admin/admin123 或自定义
        python manage.py createsuperuser
    )
)

echo.
echo ═══════════════════════════════════════════════════════════
echo ✓ 准备完成！正在启动服务器...
echo ═══════════════════════════════════════════════════════════
echo.
echo 访问地址：
echo   - 管理后台：http://localhost:8000/admin
echo.
echo 按 Ctrl+C 停止服务器
echo ═══════════════════════════════════════════════════════════
echo.

python manage.py runserver

pause

