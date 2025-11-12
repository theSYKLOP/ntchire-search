# Script pour étendre un token Facebook User à 60 jours
param(
    [Parameter(Mandatory=$true)]
    [string]$ShortToken,
    
    [Parameter(Mandatory=$true)]
    [string]$AppId,
    
    [Parameter(Mandatory=$true)]
    [string]$AppSecret
)

Write-Host "🔄 Extension du token Facebook..." -ForegroundColor Yellow
Write-Host ""

$url = "https://graph.facebook.com/v23.0/oauth/access_token"
$params = @{
    grant_type = "fb_exchange_token"
    client_id = $AppId
    client_secret = $AppSecret
    fb_exchange_token = $ShortToken
}

try {
    $response = Invoke-RestMethod -Uri $url -Method GET -Body $params
    
    if ($response.access_token) {
        Write-Host "✅ Token étendu généré avec succès !" -ForegroundColor Green
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "📋 NOUVEAU TOKEN (60 jours):" -ForegroundColor Yellow
        Write-Host $response.access_token -ForegroundColor White
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⏰ Expire dans: $($response.expires_in) secondes (~$([math]::Round($response.expires_in / 86400)) jours)" -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Copiez cette ligne dans votre fichier .env :" -ForegroundColor Yellow
        Write-Host "FB_ACCESS_TOKEN=$($response.access_token)" -ForegroundColor White
        Write-Host ""
        
        # Sauvegarder dans .env automatiquement
        $envPath = Join-Path (Split-Path $PSScriptRoot) ".env"
        if (Test-Path $envPath) {
            $envContent = Get-Content $envPath -Raw
            if ($envContent -match "FB_ACCESS_TOKEN=.*") {
                $envContent = $envContent -replace "FB_ACCESS_TOKEN=.*", "FB_ACCESS_TOKEN=$($response.access_token)"
            } else {
                $envContent += "`nFB_ACCESS_TOKEN=$($response.access_token)"
            }
            Set-Content -Path $envPath -Value $envContent
            Write-Host "✅ Token sauvegardé dans .env automatiquement !" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Erreur lors de l'extension du token" -ForegroundColor Red
        Write-Host ($response | ConvertTo-Json) -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails: $responseBody" -ForegroundColor Red
    }
}
