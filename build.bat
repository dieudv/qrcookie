@echo off
setlocal enableextensions
for %%A in (%*) do @set _%%A_=""

if defined _DEBUG_ (
    set _mode_="debug"
)

if defined _RELEASE_ (
    set _mode_="release"
)

if defined _BETA_ (
    set _mode_="beta"
)

if defined _mode_ (
    if EXIST .\build\%_mode_%\ rd .\build\%_mode_% /s/q
    if EXIST .\build\%_mode_%.zip del .\build\%_mode_%.zip
    mkdir .\build\%_mode_%\_locales\en\
    mkdir .\build\%_mode_%\ic\
    mkdir .\build\%_mode_%\js\
    call python build.py %1 %2
    if defined _RELEASE_ (
        call dir .\build\qr-cookie.zip
    )
)

if not defined _mode_ (
    echo    Type below to run:
    echo        build.bat debug
    echo        build.bat release
)