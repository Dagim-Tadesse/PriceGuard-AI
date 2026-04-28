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

Invoke-Checked $venvPython @($managePy, 'migrate')
Invoke-Checked $venvPython @($managePy, 'flush', '--noinput')
Invoke-Checked $venvPython @($loadSeedPy)

Write-Host "Demo data reset complete."