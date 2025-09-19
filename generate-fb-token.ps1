# Script pour générer un token d'application Facebook
param(
    [Parameter(Mandatory=$true)]
    [string]$AppId,
    
    [Parameter(Mandatory=$true)]
    [string]$AppSecret
)

$url = "https://graph.facebook.com/oauth/access_token?client_id=$AppId&client_secret=$AppSecret&grant_type=client_credentials"

try {
    Write-Host "Génération du token d'application Facebook..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri $url -Method GET
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.access_token) {
        Write-Host "✅ Token généré avec succès !" -ForegroundColor Green
        Write-Host "Token: $($data.access_token)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Ajoutez ce token à votre fichier .env :" -ForegroundColor Yellow
        Write-Host "FB_ACCESS_TOKEN=$($data.access_token)" -ForegroundColor White
    } else {
        Write-Host "❌ Erreur lors de la génération du token" -ForegroundColor Red
        Write-Host $response.Content -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
