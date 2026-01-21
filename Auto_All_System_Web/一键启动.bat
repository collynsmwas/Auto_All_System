@echo off
chcp 65001 >nul
echo ========================================
echo   🚀 Auto All System - 一键启动
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 检查 Docker 服务...
docker version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)
echo ✅ Docker 服务正常

echo.
echo [2/4] 启动所有服务...
docker-compose up -d
if errorlevel 1 (
    echo ❌ 启动失败
    pause
    exit /b 1
)
echo ✅ 服务启动成功

echo.
echo [3/4] 等待服务就绪...
timeout /t 10 /nobreak >nul
echo ✅ 服务已就绪

echo.
echo [4/4] 检查服务状态...
docker-compose ps

echo.
echo ========================================
echo   ✅ 系统启动完成！
echo ========================================
echo.
echo 📍 访问地址:
echo   - 前端界面: http://localhost/
echo   - 后端API:  http://localhost:8000/api/
echo   - API文档:  http://localhost:8000/api/docs/
echo   - Admin:    http://localhost:8000/admin/
echo.
echo 🎯 Google 插件:
echo   - 工作台:   http://localhost/google/dashboard
echo   - 账号管理: http://localhost/google/accounts
echo   - 一键全自动: http://localhost/google/auto-all
echo.
echo 📚 查看日志: docker-compose logs -f backend
echo 🛑 停止服务: docker-compose down
echo.

start http://localhost/

pause

