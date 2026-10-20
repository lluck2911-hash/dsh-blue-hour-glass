param(
  [ValidateSet('desktop','web')][string]$Profile = 'desktop',
  [Parameter(Mandatory=$true)][string]$PackagePath,
  [string]$DesktopAppPath = (Join-Path $env:LOCALAPPDATA 'Programs\DeepSeek Harness')
)
$ErrorActionPreference = 'Stop'
$resolvedPackage = (Resolve-Path -LiteralPath $PackagePath).Path
if (-not $resolvedPackage.EndsWith('.tgz')) { throw '请选择发布包中的 .tgz 文件。' }
if ($Profile -eq 'desktop') {
  $appResources = Join-Path $DesktopAppPath 'resources\app'
  $desktopExe = Join-Path $DesktopAppPath 'DeepSeek Harness.exe'
  $hostCli = Join-Path $appResources 'dsh\node_modules\@deepseek-ai\dsh-desktop-host\lib\cli.js'
  if (-not (Test-Path -LiteralPath $hostCli)) {
    $hostCli = Join-Path $DesktopAppPath 'resources\app.asar\dsh\node_modules\@deepseek-ai\dsh-desktop-host\lib\cli.js'
  }
  if (-not (Test-Path -LiteralPath $desktopExe) -or -not (Test-Path -LiteralPath $hostCli)) {
    throw '找不到桌面内置 CLI。请用 -DesktopAppPath 指定 DeepSeek Harness 安装目录。'
  }
  $previousNodeMode = $env:ELECTRON_RUN_AS_NODE
  try {
    $env:ELECTRON_RUN_AS_NODE = '1'
    & $desktopExe --expose-internals $hostCli plugin --profile desktop add $resolvedPackage
    $installExit = $LASTEXITCODE
  } finally {
    if ($null -eq $previousNodeMode) { Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue }
    else { $env:ELECTRON_RUN_AS_NODE = $previousNodeMode }
  }
} else {
  $dshCommand = Get-Command dsh -ErrorAction SilentlyContinue
  if (-not $dshCommand) { throw '找不到 dsh CLI，请先安装 Web 运行时。' }
  & $dshCommand.Source plugin --profile web add -w $resolvedPackage
  $installExit = $LASTEXITCODE
}
if ($installExit -ne 0) { throw "dsh 插件安装失败（退出码 $installExit）；请保留命令输出用于排查。" }
Write-Output '安装命令已完成。请保存工作、等待后台任务结束后，退出并重新打开 Harness。'
