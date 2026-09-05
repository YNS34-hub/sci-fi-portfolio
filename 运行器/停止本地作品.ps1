[CmdletBinding()]
param()

$ErrorActionPreference = "SilentlyContinue"
$stateRoot = Join-Path $env:LOCALAPPDATA "科幻作品集"

function Stop-ProcessTree {
  param([int]$ProcessId)

  $children = Get-CimInstance Win32_Process |
    Where-Object { $_.ParentProcessId -eq $ProcessId }

  foreach ($child in $children) {
    Stop-ProcessTree -ProcessId $child.ProcessId
  }

  Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
}

$closed = 0
if (Test-Path -LiteralPath $stateRoot -PathType Container) {
  Get-ChildItem -LiteralPath $stateRoot -Filter "*.json" -File |
    ForEach-Object {
      try {
        $state = Get-Content -Raw -LiteralPath $_.FullName | ConvertFrom-Json
        $process = Get-CimInstance Win32_Process -Filter "ProcessId=$($state.pid)"
        if (
          $process -and
          $process.Name -eq "node.exe" -and
          $process.CommandLine.Contains([string]$state.runtimeCli)
        ) {
          Stop-ProcessTree -ProcessId ([int]$state.pid)
          $closed++
        }
      }
      catch {
        # Ignore stale state and continue closing the remaining local works.
      }

      Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
    }
}

$shell = New-Object -ComObject WScript.Shell
$message = if ($closed -gt 0) {
  "已关闭 $closed 个本地作品服务器。"
}
else {
  "当前没有正在运行的本地作品。"
}
$null = $shell.Popup($message, 8, "科幻作品集", 64)
