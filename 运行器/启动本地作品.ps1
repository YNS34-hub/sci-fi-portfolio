[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectDirectory,

  [Parameter(Mandatory = $true)]
  [string]$ProjectSlug,

  [Parameter(Mandatory = $true)]
  [string]$DisplayName,

  [Parameter(Mandatory = $true)]
  [string]$ExpectedText,

  [Parameter(Mandatory = $true)]
  [int]$PreferredPort,

  [string]$RuntimeCli = ""
)

$ErrorActionPreference = "Stop"

function Show-Notice {
  param(
    [string]$Message,
    [int]$Icon = 48
  )

  $shell = New-Object -ComObject WScript.Shell
  $null = $shell.Popup($Message, 12, "科幻作品集", $Icon)
}

function Test-LocalArtwork {
  param(
    [string]$Url,
    [string]$Needle
  )

  foreach ($attempt in 1..2) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 4
      if ($response.StatusCode -eq 200 -and $response.Content.Contains($Needle)) {
        return $true
      }
    }
    catch {
      # A cold PowerShell HTTP client can exceed the first timeout on Windows.
    }

    if ($attempt -eq 1) {
      Start-Sleep -Milliseconds 200
    }
  }

  return $false
}

function Test-PortFree {
  param([int]$Port)

  $listener = [System.Net.Sockets.TcpListener]::new(
    [System.Net.IPAddress]::Loopback,
    $Port
  )

  try {
    $listener.Start()
    return $true
  }
  catch {
    return $false
  }
  finally {
    $listener.Stop()
  }
}

if (-not (Test-Path -LiteralPath $ProjectDirectory -PathType Container)) {
  Show-Notice "找不到《$DisplayName》的本地作品文件。"
  exit 1
}

$workerBuild = Test-Path -LiteralPath (Join-Path $ProjectDirectory "dist\server\index.js") -PathType Leaf
$staticBuild = Test-Path -LiteralPath (Join-Path $ProjectDirectory "dist\index.html") -PathType Leaf
if (-not ($workerBuild -or $staticBuild)) {
  Show-Notice "《$DisplayName》的本地构建不完整，无法打开。"
  exit 1
}

$localServer = Join-Path $PSScriptRoot "local-artwork-server.mjs"
if (-not (Test-Path -LiteralPath $localServer -PathType Leaf)) {
  Show-Notice "本地作品服务器不存在，无法打开《$DisplayName》。"
  exit 1
}

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
  Show-Notice "电脑上没有找到 Node.js，无法启动本地作品。"
  exit 1
}

$stateRoot = Join-Path $env:LOCALAPPDATA "科幻作品集"
$logRoot = Join-Path $stateRoot "运行日志"
$stateFile = Join-Path $stateRoot "$ProjectSlug.json"
New-Item -ItemType Directory -Force -Path $logRoot | Out-Null

if (Test-Path -LiteralPath $stateFile -PathType Leaf) {
  try {
    $state = Get-Content -Raw -LiteralPath $stateFile | ConvertFrom-Json
    $existingUrl = "http://127.0.0.1:$($state.port)/"
    if (Test-LocalArtwork -Url $existingUrl -Needle $ExpectedText) {
      Start-Process $existingUrl
      exit 0
    }
  }
  catch {
    # A stale state file is harmless; a fresh server will be started below.
  }
}

$port = $null
foreach ($candidate in $PreferredPort..($PreferredPort + 20)) {
  if (Test-PortFree -Port $candidate) {
    $port = $candidate
    break
  }
}

if (-not $port) {
  Show-Notice "没有找到可用的本地端口，暂时无法打开《$DisplayName》。"
  exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$stdoutPath = Join-Path $logRoot "$ProjectSlug-$timestamp.stdout.log"
$stderrPath = Join-Path $logRoot "$ProjectSlug-$timestamp.stderr.log"
$runtimeArgument = "`"$localServer`""
$projectArgument = "`"$ProjectDirectory`""
$arguments = @(
  $runtimeArgument,
  "--project",
  $projectArgument,
  "--port",
  $port.ToString()
)

$server = Start-Process `
  -FilePath $nodeCommand.Source `
  -ArgumentList $arguments `
  -WorkingDirectory $ProjectDirectory `
  -WindowStyle Hidden `
  -RedirectStandardOutput $stdoutPath `
  -RedirectStandardError $stderrPath `
  -PassThru

$url = "http://127.0.0.1:$port/"
$statePayload = [ordered]@{
  pid = $server.Id
  port = $port
  displayName = $DisplayName
  projectDirectory = $ProjectDirectory
  runtimeCli = $localServer
  startedAt = (Get-Date).ToString("o")
}
$statePayload | ConvertTo-Json | Set-Content -LiteralPath $stateFile -Encoding UTF8

for ($attempt = 0; $attempt -lt 50; $attempt++) {
  if (Test-LocalArtwork -Url $url -Needle $ExpectedText) {
    Start-Process $url
    exit 0
  }

  if ($server.HasExited) {
    break
  }

  Start-Sleep -Milliseconds 400
}

if (-not $server.HasExited) {
  Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
}

Show-Notice "《$DisplayName》启动失败。运行记录保存在：`n$logRoot"
exit 1
