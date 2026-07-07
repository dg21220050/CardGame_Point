$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataDir = Join-Path $Root "data"
$ControlFile = Join-Path $DataDir "server-control.json"
$StdoutLog = Join-Path $DataDir "server.out.log"
$StderrLog = Join-Path $DataDir "server.err.log"
$BundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$Node = $null

function Read-ControlFile {
  if (-not (Test-Path -LiteralPath $ControlFile)) {
    return $null
  }

  try {
    return Get-Content -LiteralPath $ControlFile -Raw | ConvertFrom-Json
  } catch {
    return $null
  }
}

function Get-ControlUrl($Control) {
  if ($Control -and $Control.localUrl) {
    return [string]$Control.localUrl
  }
  if ($Control -and $Control.port) {
    return "http://127.0.0.1:$($Control.port)"
  }
  return $null
}

function Test-ControlledProcess($Control) {
  if (-not $Control -or -not $Control.pid) {
    return $false
  }

  try {
    Get-Process -Id ([int]$Control.pid) -ErrorAction Stop | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Test-ServerReady($Url) {
  if (-not $Url) {
    return $false
  }

  try {
    Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2 | Out-Null
    return $true
  } catch {
    return $false
  }
}

if (Test-Path $BundledNode) {
  $Node = $BundledNode
} else {
  $Command = Get-Command node -ErrorAction SilentlyContinue
  if ($Command) {
    $Node = $Command.Source
  }
}

if (-not $Node) {
  Write-Host "Node.js was not found. Install Node.js 18+ or run this from the Codex desktop environment." -ForegroundColor Red
  exit 1
}

New-Item -ItemType Directory -Path $DataDir -Force | Out-Null

$ExistingControl = Read-ControlFile
$ExistingUrl = Get-ControlUrl $ExistingControl
if ((Test-ControlledProcess $ExistingControl) -and (Test-ServerReady $ExistingUrl)) {
  Write-Host "CardGame Point server is already running." -ForegroundColor Green
  Write-Host "Game URL: $ExistingUrl"
  Write-Host "You can close this window. Use Stop server.bat to stop the server."
  exit 0
}

if (Test-Path -LiteralPath $ControlFile) {
  Write-Host "Removing stale server control file." -ForegroundColor Yellow
  Remove-Item -LiteralPath $ControlFile -Force
}

Write-Host "Starting CardGame Point from $Root"
Write-Host "The server will keep running after this window is closed."

$Process = Start-Process `
  -FilePath $Node `
  -ArgumentList @("server.js") `
  -WorkingDirectory $Root `
  -WindowStyle Hidden `
  -RedirectStandardOutput $StdoutLog `
  -RedirectStandardError $StderrLog `
  -PassThru

for ($i = 0; $i -lt 80; $i++) {
  Start-Sleep -Milliseconds 250

  if ($Process.HasExited) {
    Write-Host "The server stopped during startup. See the log files below." -ForegroundColor Red
    Write-Host "Output log: $StdoutLog"
    Write-Host "Error log:  $StderrLog"
    exit 1
  }

  $Control = Read-ControlFile
  $Url = Get-ControlUrl $Control
  if ((Test-ControlledProcess $Control) -and (Test-ServerReady $Url)) {
    Write-Host "CardGame Point server is running." -ForegroundColor Green
    Write-Host "Game URL: $Url"
    Write-Host "Process ID: $($Control.pid)"
    Write-Host "You can close this window. Use Stop server.bat to stop the server."
    exit 0
  }
}

Write-Host "The server process started, but it did not become ready in time." -ForegroundColor Yellow
Write-Host "Output log: $StdoutLog"
Write-Host "Error log:  $StderrLog"
exit 1
