# 使用PowerShell测试文章发布API

# 测试本地后端服务
Write-Host "测试本地后端服务..."
$localHealthUrl = "http://localhost:3000/api/health"
Write-Host "访问: $localHealthUrl"
$localHealthResponse = Invoke-RestMethod -Uri $localHealthUrl -Method Get -ErrorAction SilentlyContinue
if ($localHealthResponse) {
    Write-Host "✅ 本地健康检查成功: $($localHealthResponse | ConvertTo-Json -Compress)"
} else {
    Write-Host "❌ 本地健康检查失败"
}

# 测试文章发布到本地后端
Write-Host "\n测试文章发布到本地后端..."
$articleData = @{
    title = "测试文章"
    category = "技术"
    summary = "这是一篇测试文章"
    content = "测试内容"
    author = "测试用户"
    createdAt = (Get-Date).ToUniversalTime().ToString("o")
    updatedAt = (Get-Date).ToUniversalTime().ToString("o")
}

$localPostUrl = "http://localhost:3000/api/articles"
Write-Host "发布到: $localPostUrl"
try {
    $localPostResponse = Invoke-RestMethod -Uri $localPostUrl -Method Post -Body ($articleData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "✅ 本地文章发布成功: $($localPostResponse | ConvertTo-Json -Compress)"
} 
catch {
    Write-Host "❌ 本地文章发布失败: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $streamReader = New-Object System.IO.StreamReader($errorContent)
        $errorDetails = $streamReader.ReadToEnd()
        Write-Host "错误详情: $errorDetails"
    }
}

# 测试获取文章列表
Write-Host "\n测试获取文章列表..."
$localGetUrl = "http://localhost:3000/api/articles"
Write-Host "获取列表: $localGetUrl"
try {
    $localGetResponse = Invoke-RestMethod -Uri $localGetUrl -Method Get
    Write-Host "✅ 文章列表获取成功，共 $($localGetResponse.articles.Count) 篇文章"
} catch {
    Write-Host "❌ 文章列表获取失败: $($_.Exception.Message)"
}