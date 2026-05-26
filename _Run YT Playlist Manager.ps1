# Launch YT Playlist Manager dev app hidden
# Place this .ps1 file in the project root folder.

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show(
        "This script must be placed in the project root folder.`nExpected package.json in:`n$ProjectRoot",
        "YT Playlist Manager launcher",
        "OK",
        "Error"
    )
    exit 1
}

$HiddenRunner = @"
`$ProjectRoot = '$($ProjectRoot.Replace("'", "''"))'
Set-Location `$ProjectRoot

# Fix Electron-as-Node issue for this PowerShell session
Remove-Item Env:\ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue

# Repair Electron path.txt if Electron exists but path.txt is missing
`$ElectronExe = Join-Path `$ProjectRoot 'node_modules\electron\dist\electron.exe'
`$ElectronPathTxt = Join-Path `$ProjectRoot 'node_modules\electron\path.txt'

if ((Test-Path `$ElectronExe) -and -not (Test-Path `$ElectronPathTxt)) {
    [System.IO.File]::WriteAllText(`$ElectronPathTxt, 'electron.exe')
}

# Install dependencies if node_modules is missing
if (-not (Test-Path (Join-Path `$ProjectRoot 'node_modules'))) {
    npm install *> (Join-Path `$ProjectRoot 'launcher-install.log')
}

# Launch dev app and keep this hidden process alive
npm run dev *> (Join-Path `$ProjectRoot 'launcher-dev.log')
"@

$TempScript = Join-Path $env:TEMP "yt-playlist-manager-hidden-dev.ps1"
[System.IO.File]::WriteAllText($TempScript, $HiddenRunner)

Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", "`"$TempScript`""
) -WorkingDirectory $ProjectRoot

exit