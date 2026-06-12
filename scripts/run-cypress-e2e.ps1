$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$DistDir = Join-Path $RootDir "dist"
$IndexFile = Join-Path $DistDir "index.html"

Set-Location $RootDir

if (-not (Test-Path -LiteralPath $IndexFile)) {
  Write-Error "dist/index.html was not generated. Run npm run build:web before Cypress."
  exit 1
}

function Test-PortAvailable {
  param([int] $Port)

  $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  return $null -eq $connection
}

$PreferredPort = 4173
if ($env:CYPRESS_PORT) {
  $PreferredPort = [int] $env:CYPRESS_PORT
}

$Port = $null
for ($Candidate = $PreferredPort; $Candidate -lt ($PreferredPort + 10); $Candidate++) {
  if (Test-PortAvailable -Port $Candidate) {
    $Port = $Candidate
    break
  }
}

if ($null -eq $Port) {
  Write-Error "No available port found from $PreferredPort to $($PreferredPort + 9)."
  exit 1
}

$Server = $null
$ExitCode = 1

try {
  $Server = Start-Process `
    -FilePath "node" `
    -ArgumentList @(".\scripts\serve-dist-spa.js", "$Port") `
    -PassThru `
    -WindowStyle Hidden

  Start-Sleep -Seconds 3

  if ($Server.HasExited) {
    Write-Error "The temporary Cypress web server failed to start."
    exit 1
  }

  $BaseUrl = "http://127.0.0.1:$Port"
  Write-Host "Serving dist for Cypress at $BaseUrl"

  npm run cy:run -- --config "baseUrl=$BaseUrl"
  $ExitCode = $LASTEXITCODE
}
finally {
  if ($Server -and -not $Server.HasExited) {
    Stop-Process -Id $Server.Id -Force
  }
}

exit $ExitCode
