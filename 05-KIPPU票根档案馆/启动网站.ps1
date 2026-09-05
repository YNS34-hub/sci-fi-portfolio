$ErrorActionPreference = "Stop"
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$distPath = Join-Path $projectPath "dist"
$port = 48882

if (-not (Test-Path -LiteralPath (Join-Path $distPath "index.html"))) {
    throw "未找到已构建的网站文件。请先在项目目录运行 npm run build。"
}

$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCommand) {
    throw "未找到 Python，无法启动本地预览。"
}

$server = Start-Process -FilePath $pythonCommand.Source -ArgumentList @(
    "-m", "http.server", $port, "--bind", "127.0.0.1", "--directory", $distPath
) -WindowStyle Hidden -PassThru

Start-Sleep -Seconds 1
Start-Process "http://127.0.0.1:$port"
Write-Host "KIPPU 已启动。关闭此窗口即可停止网站。"
Wait-Process -Id $server.Id
