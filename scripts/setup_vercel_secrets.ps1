$ErrorActionPreference = "Stop"

function Set-Secret {
    param (
        [string]$Name,
        [string]$Value
    )
    if (-not $Value) {
        Write-Warning "Skipped $Name (Empty value)"
        return
    }
    # Use standard input to avoid leaking secrets in process list
    $Value | gh secret set $Name
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $Name set successfully." -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to set $Name" -ForegroundColor Red
    }
}

Write-Host "`n🚀 Antigravity Vercel Deployment Setup" -ForegroundColor Cyan
Write-Host "========================================"

# 1. Set IDs (Auto-detected)
$orgId = "team_rNRog4UzFdAf2D54APefM5HG"
$projectId = "prj_kwKGzYr9RRbky1TOR2xd73k1qTnJ"

Write-Host "`n[1/3] Setting Vercel IDs..."
Set-Secret -Name "VERCEL_ORG_ID" -Value $orgId
Set-Secret -Name "VERCEL_PROJECT_ID" -Value $projectId

# 2. Vercel Token
Write-Host "`n[2/3] Vercel Token"
Write-Host "Please create a token here: https://vercel.com/account/tokens"
Write-Host "  Name suggestion: Antigravity_Deploy"
$vercelToken = Read-Host "Paste Vercel Token (Input is hidden)" -AsSecureString
$vercelTokenBSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($vercelToken)
$vercelTokenPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($vercelTokenBSTR)

Set-Secret -Name "VERCEL_TOKEN" -Value $vercelTokenPlain

# 3. GitHub Token
Write-Host "`n[3/3] GitHub Token"
Write-Host "Please create a token here: https://github.com/settings/tokens/new?scopes=repo,workflow,write:packages&description=Antigravity_Deploy"
$ghToken = Read-Host "Paste GitHub Token (Input is hidden)" -AsSecureString
$ghTokenBSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($ghToken)
$ghTokenPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($ghTokenBSTR)

Set-Secret -Name "GH_TOKEN" -Value $ghTokenPlain
Set-Secret -Name "PERSONAL_ACCESS_TOKEN" -Value $ghTokenPlain

Write-Host "`n🎉 Setup Complete! You are ready to deploy." -ForegroundColor Cyan
Write-Host "Try pushing to master to trigger deployment."
