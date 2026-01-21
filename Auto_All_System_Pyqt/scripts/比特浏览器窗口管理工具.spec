# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['create_window_gui.py'],
    pathex=[],
    binaries=[],
    datas=[('beta-1.svg', '.'), ('app_icon.ico', '.'), ('web_admin', 'web_admin')],
    hiddenimports=['PyQt6', 'playwright', 'pyotp', 'deep_translator'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='比特浏览器窗口管理工具',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['app_icon.ico'],
)
