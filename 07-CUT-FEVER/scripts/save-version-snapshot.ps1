param(
  [Parameter(Mandatory = $true)][string]$SourceDirectory,
  [Parameter(Mandatory = $true)][string]$DestinationDirectory
)

$ErrorActionPreference = 'Stop'
$source = [System.IO.Path]::GetFullPath($SourceDirectory)
$destination = [System.IO.Path]::GetFullPath($DestinationDirectory)

if (-not (Test-Path -LiteralPath $source -PathType Container)) {
  throw "Source directory does not exist: $source"
}
if (Test-Path -LiteralPath $destination) {
  throw "Snapshot destination already exists; refusing to overwrite: $destination"
}
if (-not $destination.StartsWith($source + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw 'Snapshot destination must be a new child of the project directory.'
}

$items = @(
  'index.html',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'version-info.json',
  'README-中文.md',
  '操作表.txt',
  'assets',
  'public',
  'src',
  'scripts',
  'tests',
  'dist',
  'evidence\v1'
)

New-Item -ItemType Directory -Path $destination | Out-Null
foreach ($item in $items) {
  $itemPath = Join-Path $source $item
  if (-not (Test-Path -LiteralPath $itemPath)) {
    throw "Required snapshot item is missing: $itemPath"
  }
  Copy-Item -LiteralPath $itemPath -Destination $destination -Recurse
}

$files = Get-ChildItem -LiteralPath $destination -Recurse -File | Sort-Object FullName
$hashes = foreach ($file in $files) {
  [pscustomobject]@{
    path = [System.IO.Path]::GetRelativePath($destination, $file.FullName).Replace('\', '/')
    bytes = $file.Length
    sha256 = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  }
}

$manifest = [pscustomobject]@{
  schemaVersion = 1
  label = 'CUT//FEVER v1 original immutable snapshot'
  createdAt = [DateTimeOffset]::Now.ToString('o')
  source = $source
  fileCount = $hashes.Count
  totalBytes = ($hashes | Measure-Object -Property bytes -Sum).Sum
  files = $hashes
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $destination 'snapshot-sha256.json') -Encoding utf8

Write-Output "Snapshot saved: $destination"
Write-Output "Files: $($hashes.Count)"
Write-Output "Bytes: $($manifest.totalBytes)"
