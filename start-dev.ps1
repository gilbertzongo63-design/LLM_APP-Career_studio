param(
    [switch]$UseCurrentWindow
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"
$frontendDir = Join-Path $projectRoot "frontend"
$venvDir = Join-Path $projectRoot ".venv"
$venvPython = Join-Path $projectRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "Virtual environment not found. Creating .venv..."
    python -m venv $venvDir

    if (-not (Test-Path $venvPython)) {
        throw "Virtual environment creation failed at .venv\Scripts\python.exe."
    }

    Write-Host "Installing backend dependencies..."
    & $venvPython -m pip install --upgrade pip
    & $venvPython -m pip install -r (Join-Path $backendDir "requirements.txt")
}

function Import-DotEnv {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) {
            return
        }

        $parts = $line -split "=", 2
        if ($parts.Count -ne 2) {
            return
        }

        [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1])
    }
}

Import-DotEnv (Join-Path $projectRoot ".env")

if (-not $env:REACT_APP_API_URL) {
    $env:REACT_APP_API_URL = "http://localhost:8000"
}
if (-not $env:PORT) {
    $env:PORT = "8000"
}

$backendCommand = "Set-Location '$backendDir'; & '$venvPython' -m uvicorn app.main:app --reload --host 127.0.0.1 --port $env:PORT"
$frontendCommand = "Set-Location '$frontendDir'; `$env:REACT_APP_API_URL='$env:REACT_APP_API_URL'; cmd /c npm start"

if ($UseCurrentWindow) {
    Write-Host "Starting backend in a new window..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand | Out-Null

    Write-Host "Starting frontend in the current window..."
    Invoke-Expression $frontendCommand
    exit $LASTEXITCODE
}

Write-Host "Starting backend and frontend in separate windows..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand | Out-Null
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand | Out-Null

Write-Host "Backend:  http://localhost:$env:PORT/api/health"
Write-Host "Frontend: http://localhost:3000"
