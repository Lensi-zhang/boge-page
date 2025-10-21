# Test backend API

# Test local health check
Write-Host "Testing local backend health check..."
$localHealthUrl = "http://localhost:3000/api/health"
Write-Host "Accessing: $localHealthUrl"
try {
    $localHealthResponse = Invoke-RestMethod -Uri $localHealthUrl -Method Get -ErrorAction Stop
    Write-Host "✅ Local health check success!"
} catch {
    Write-Host "❌ Local health check failed: $_"
}

# Test article posting
Write-Host "\nTesting article posting..."
$articleData = @{
    title = "Test Article"
    category = "Technology"
    summary = "This is a test article"
    content = "Test content"
    author = "Test User"
    createdAt = (Get-Date).ToUniversalTime().ToString("o")
    updatedAt = (Get-Date).ToUniversalTime().ToString("o")
}

$localPostUrl = "http://localhost:3000/api/articles"
Write-Host "Posting to: $localPostUrl"
try {
    $localPostResponse = Invoke-RestMethod -Uri $localPostUrl -Method Post -Body ($articleData | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Article posted successfully!"
} catch {
    Write-Host "❌ Article posting failed: $_"
}

# Test getting article list
Write-Host "\nTesting article list retrieval..."
$localGetUrl = "http://localhost:3000/api/articles"
Write-Host "Getting from: $localGetUrl"
try {
    $localGetResponse = Invoke-RestMethod -Uri $localGetUrl -Method Get -ErrorAction Stop
    Write-Host "✅ Article list retrieved successfully!"
} catch {
    Write-Host "❌ Article list retrieval failed: $_"
}