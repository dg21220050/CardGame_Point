$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ControlFile = Join-Path $Root "data\server-control.json"

if (-not (Test-Path -LiteralPath $ControlFile)) {
  Write-Host "No running CardGame Point server was found for this folder." -ForegroundColor Yellow
  Write-Host "If the browser still opens the game, close the terminal window that started the server."
  exit 0
}

try {
  $Control = Get-Content -LiteralPath $ControlFile -Raw | ConvertFrom-Json
} catch {
  Write-Host "The server control file could not be read: $ControlFile" -ForegroundColor Red
  exit 1
}

if (-not $Control.port -or -not $Control.shutdownToken) {
  Write-Host "The server control file is incomplete: $ControlFile" -ForegroundColor Red
  exit 1
}

$Url = "http://127.0.0.1:$($Control.port)/api/admin/shutdown"

try {
  Invoke-WebRequest `
    -UseBasicParsing `
    -Method Post `
    -Uri $Url `
    -Headers @{ "X-Shutdown-Token" = [string]$Control.shutdownToken } `
    -TimeoutSec 5 | Out-Null

  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 250
    if (-not (Test-Path -LiteralPath $ControlFile)) {
      Write-Host "CardGame Point server has been stopped." -ForegroundColor Green
      exit 0
    }
  }

  Write-Host "Stop request was sent. If the server is still visible, run this script once more." -ForegroundColor Yellow
  exit 0
} catch {
  Write-Host "Could not contact the CardGame Point server at $Url." -ForegroundColor Red
  Write-Host "It may already be stopped, or it may be an older server version started before stop-server.ps1 existed."
  exit 1
}
