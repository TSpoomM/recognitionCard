<#
Quick redeploy for routine code changes: rebuild + restart only.
Run this ON THE SERVER (not over the network share) in an elevated PowerShell.

Skips the node_modules wipe/full reinstall that deploy.ps1 always does - use
deploy.ps1 instead if dependencies changed, or if something is actually broken
(corrupted native binaries, stale env overrides, orphaned processes, etc).
#>

$ErrorActionPreference = "Stop"
$app = "C:\xampp\htdocs\recognitionCard\my-app"
$taskName = "RecognitionApp"

$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "This PowerShell session is not running elevated. Right-click PowerShell -> 'Run as administrator', then re-run this script."
}

if (-not (Test-Path $app)) {
    throw "Expected app at $app but it was not found. Run this script on the server, not over a network path."
}

Set-Location $app

Write-Host "== Loading .env into this process ==" -ForegroundColor Cyan
Get-Content "$app\.env" | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $key, $value = $line -split "=", 2
        $key = $key.Trim()
        $value = $value.Trim()
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        if ($key) {
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

Write-Host "== Checking for stale NEXT_PUBLIC_BASE_PATH environment overrides ==" -ForegroundColor Cyan
foreach ($scope in "Machine","User") {
    $val = [Environment]::GetEnvironmentVariable("NEXT_PUBLIC_BASE_PATH", $scope)
    if ($val) {
        Write-Host "Found NEXT_PUBLIC_BASE_PATH='$val' set at $scope scope. This silently overrides .env. Removing it so .env's value (/recognitioncard) applies." -ForegroundColor Yellow
        [Environment]::SetEnvironmentVariable("NEXT_PUBLIC_BASE_PATH", $null, $scope)
    }
}
Remove-Item Env:\NEXT_PUBLIC_BASE_PATH -ErrorAction SilentlyContinue

Write-Host "== Stopping and removing any existing task (it may point at a different/old folder, e.g. the old recognition deployment) ==" -ForegroundColor Cyan
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

$conns = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue
foreach ($c in $conns) {
    $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
    if ($proc -and $proc.ProcessName -eq "node") {
        Write-Host "Stopping node.exe (PID $($proc.Id)) still bound to port 4000." -ForegroundColor Yellow
        Stop-Process -Id $proc.Id -Force
    }
}
Start-Sleep -Seconds 2

Write-Host "== Installing any new/changed dependencies ==" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }

Write-Host "== Building production bundle ==" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }

Remove-Item "$app\service.log" -Force -ErrorAction SilentlyContinue

Write-Host "== Registering task (points at $app) ==" -ForegroundColor Cyan
$action    = New-ScheduledTaskAction -Execute "cmd.exe" -Argument '/c npm start >> "service.log" 2>&1' -WorkingDirectory $app
$trigger   = New-ScheduledTaskTrigger -AtStartup
$settings  = New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) `
             -ExecutionTimeLimit ([TimeSpan]::Zero) -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger `
    -Settings $settings -Principal $principal -Description "Next.js recognitionCard app on port 4000 (/recognitioncard)" | Out-Null

Write-Host "== Starting task ==" -ForegroundColor Cyan
Start-ScheduledTask -TaskName $taskName
Start-Sleep -Seconds 5

$listening = netstat -ano | Select-String ":4000\s" | Select-String "LISTENING"
if ($listening) {
    Write-Host "Port 4000 is listening. Redeploy looks good." -ForegroundColor Green
} else {
    Write-Host "Port 4000 is NOT listening yet. Check $app\service.log." -ForegroundColor Red
}

Write-Host "== Restarting Apache so the updated ProxyPass (/recognitioncard) takes effect ==" -ForegroundColor Cyan
Restart-Service -Name "Apache2.4" -Force
Start-Sleep -Seconds 2
Get-Service -Name "Apache2.4" | Format-List Name, Status

Write-Host "Check: http://localhost/recognitioncard"
