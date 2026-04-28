Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$venvPython = Join-Path $repoRoot ".venv\Scripts\python.exe"
$managePy = Join-Path $repoRoot "backend\priceguard\manage.py"
$loadSeedPy = Join-Path $repoRoot "backend\priceguard\load_seed.py"

function Invoke-Checked {
    param(
        [string]$FilePath,
        [string[]]$Arguments
    )

    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed: $FilePath $($Arguments -join ' ')"
    }
}

if (-not (Test-Path $venvPython)) {
    python -m venv (Join-Path $repoRoot ".venv")
}

Invoke-Checked $venvPython @('-m', 'pip', 'install', '-U', 'pip')
Invoke-Checked $venvPython @('-m', 'pip', 'install', '-r', (Join-Path $repoRoot 'requirements.txt'))
Invoke-Checked $venvPython @($managePy, 'migrate')
Invoke-Checked $venvPython @($loadSeedPy)

Write-Host "Setup complete. Start the backend with: $venvPython backend\priceguard\manage.py runserver 8000"