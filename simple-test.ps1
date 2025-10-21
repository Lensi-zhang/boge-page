# 简单测试后端API

# 测试本地健康检查
Write-Host "测试本地后端健康检查..."
$localHealthUrl = "http://localhost:3000/api/health"
Write-Host "访问: $localHealthUrl"
try {
    $localHealthResponse = Invoke-RestMethod -Uri $localHealthUrl -Method Get -ErrorAction Stop
    Write-Host "✅ 本地健康检查成功: $($localHealthResponse | ConvertTo-Json -Compress)"
} catch {
    Write-Host "❌ 本地健康检查失败: $_"
}

# 测试文章发布
Write-Host "\n测试文章发布..."
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
    $localPostResponse = Invoke-RestMethod -Uri $localPostUrl -Method Post -Body ($articleData | ConvertTo-Json) -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ 文章发布成功!"
} catch {
    Write-Host "❌ 文章发布失败: $_"
}

# 测试获取文章列表
Write-Host "\n测试获取文章列表..."
$localGetUrl = "http://localhost:3000/api/articles"
Write-Host "获取列表: $localGetUrl"
try {
    $localGetResponse = Invoke-RestMethod -Uri $localGetUrl -Method Get -ErrorAction Stop
    Write-Host "✅ 文章列表获取成功!"
} catch {
    Write-Host "❌ 文章列表获取失败: $_"
}