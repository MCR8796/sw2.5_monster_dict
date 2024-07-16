# -*- mode: python ; coding: utf-8 -*-

add_datas = [
    ('templates/*', 'templates'),
    ('static/js/*', 'static/js'),
    ('static/css/*', 'static/css')
]

a = Analysis(
    ['app.py', 'server.py', 'module/sw25.py', 'module/ccfolia.py'],
    pathex=[],
    binaries=[],
    datas=add_datas,
    hiddenimports=[],
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
    name='app',
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
)
