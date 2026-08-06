<#
Deploys the recognitionCard Next.js app as a Task Scheduler job on this machine.
Run this ON THE SERVER (not over the network share) in an elevated PowerShell.
Idempotent: safe to re-run after code changes to rebuild and restart.

Replaces the older deployment that used to live at C:\xampp\htdocs\recognition
(path /recognition) - this app now serves at /recognitioncard on the same port.
#>

$ErrorActionPreference = "Stop"
$app = "C:\xampp\htdocs\recognitionCard\my-app"
$taskName = "RecognitionApp"

$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "This PowerShell session is not running elevated. Right-click PowerShell -> 'Run as administrator', then re-run this script. (Registering the scheduled task requires admin rights.)"
}

if (-not (Test-Path $app)) {
    throw "Expected app at $app but it was not found. Run this script on the server, not over a network path."
}

Set-Location $app

Write-Host "== Loading .env into this process (so npm install and the running app agree on every value, e.g. PUPPETEER_CACHE_DIR) ==" -ForegroundColor Cyan
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

Write-Host "== Stopping any existing deployment before touching files ==" -ForegroundColor Cyan
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Task already exists, stopping it." -ForegroundColor Yellow
    Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

Write-Host "== Freeing port 4000 if a stale process is still holding it ==" -ForegroundColor Cyan
$conns = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue
foreach ($c in $conns) {
    $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        if ($proc.ProcessName -eq "node") {
            Write-Host "Stopping stale node.exe (PID $($proc.Id)) that was still bound to port 4000 (the old /recognition deployment)." -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force
        } else {
            Write-Host "WARNING: port 4000 is held by '$($proc.ProcessName)' (PID $($proc.Id)), not node.exe. Not killing it automatically - investigate manually, the new deploy will fail to bind until this is freed." -ForegroundColor Red
        }
    }
}
Start-Sleep -Seconds 2

if (Test-Path "$app\.next") {
    Write-Host "== Removing previous build output (.next) to avoid stale basePath being reused ==" -ForegroundColor Cyan
    Remove-Item "$app\.next" -Recurse -Force
}

if (Test-Path "$app\node_modules") {
    Write-Host "== Removing existing node_modules (may contain binaries mangled by a prior network-path install) ==" -ForegroundColor Cyan
    Remove-Item "$app\node_modules" -Recurse -Force
}

Write-Host "== Installing dependencies (clean) ==" -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }

Write-Host "== Building production bundle ==" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }

Write-Host "== Registering scheduled task ==" -ForegroundColor Cyan
Remove-Item "$app\service.log" -Force -ErrorAction SilentlyContinue

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

Write-Host "== Status ==" -ForegroundColor Cyan
Get-ScheduledTask -TaskName $taskName | Get-ScheduledTaskInfo | Format-List TaskName, LastTaskResult, LastRunTime

$listening = netstat -ano | Select-String ":4000\s" | Select-String "LISTENING"
if ($listening) {
    Write-Host "Port 4000 is listening. Deployment looks good." -ForegroundColor Green
} else {
    Write-Host "Port 4000 is NOT listening yet. Check $app\service.log or Task Scheduler history for RecognitionApp." -ForegroundColor Red
}

Write-Host "== Restarting Apache so the updated ProxyPass (/recognitioncard) takes effect ==" -ForegroundColor Cyan
Restart-Service -Name "Apache2.4" -Force
Start-Sleep -Seconds 2
Get-Service -Name "Apache2.4" | Format-List Name, Status

Write-Host "Check: http://localhost/recognitioncard"
