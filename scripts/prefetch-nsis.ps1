# Prefetch Tauri NSIS toolchain into local cache so `tauri build` won't
# re-download nsis-3.zip from GitHub every time.
#
# Cache dir: %LOCALAPPDATA%\tauri\NSIS
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/prefetch-nsis.ps1

$ErrorActionPreference = 'Stop'

$cache = Join-Path $env:LOCALAPPDATA 'tauri'
$nsis = Join-Path $cache 'NSIS'
$mirrorPrefix = if ($env:TAURI_GITHUB_MIRROR) { $env:TAURI_GITHUB_MIRROR.TrimEnd('/') } else { 'https://ghfast.top' }

$zipUrl = "$mirrorPrefix/https://github.com/tauri-apps/binary-releases/releases/download/nsis-3/nsis-3.zip"
$dllUrl = "$mirrorPrefix/https://github.com/tauri-apps/nsis-tauri-utils/releases/download/nsis_tauri_utils-v0.4.1/nsis_tauri_utils.dll"
$expectedDllSha1 = 'F99A50209A345185A84D34D0E5F66D04C75FF52F'

$required = @(
  'makensis.exe',
  'Bin\makensis.exe',
  'Stubs\lzma-x86-unicode',
  'Stubs\lzma_solid-x86-unicode',
  'Plugins\x86-unicode\nsis_tauri_utils.dll',
  'Include\MUI2.nsh',
  'Include\FileFunc.nsh',
  'Include\x64.nsh',
  'Include\nsDialogs.nsh',
  'Include\WinMessages.nsh'
)

function Test-NsisComplete {
  foreach ($r in $required) {
    if (-not (Test-Path (Join-Path $nsis $r))) { return $false }
  }
  $dll = Join-Path $nsis 'Plugins\x86-unicode\nsis_tauri_utils.dll'
  $sha1 = (Get-FileHash $dll -Algorithm SHA1).Hash
  return $sha1 -eq $expectedDllSha1
}

function Get-RemoteFile([string]$Url, [string]$OutFile) {
  Write-Host "Downloading $Url"
  Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing
}

New-Item -ItemType Directory -Force -Path $cache | Out-Null

if (Test-NsisComplete) {
  Write-Host "NSIS cache already complete: $nsis"
  exit 0
}

Write-Host 'NSIS cache incomplete — refreshing...'
if (Test-Path $nsis) {
  Remove-Item $nsis -Recurse -Force
}

$zipPath = Join-Path $cache 'nsis-3.zip'
Get-RemoteFile $zipUrl $zipPath
Expand-Archive -Path $zipPath -DestinationPath $cache -Force

$extracted = Join-Path $cache 'nsis-3.08'
if (-not (Test-Path $extracted)) {
  throw "Expected extracted folder not found: $extracted"
}
Rename-Item $extracted 'NSIS'

$pluginDir = Join-Path $nsis 'Plugins\x86-unicode'
New-Item -ItemType Directory -Force -Path $pluginDir | Out-Null
$dllTmp = Join-Path $cache 'nsis_tauri_utils.dll'
Get-RemoteFile $dllUrl $dllTmp
Copy-Item $dllTmp (Join-Path $pluginDir 'nsis_tauri_utils.dll') -Force

if (-not (Test-NsisComplete)) {
  throw 'NSIS cache still incomplete after prefetch'
}

Write-Host "NSIS cache ready: $nsis"
Write-Host 'Next builds should skip downloading nsis-3.zip.'
