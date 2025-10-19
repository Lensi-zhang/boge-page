# 博格项目部署指南

本指南将帮助您在Termux服务器上使用Nginx部署博格项目。

## 1. 准备工作

### 1.1 确保打包完成

前端项目已通过 `npm run build` 命令打包，生成的静态文件位于 `dist` 目录。

### 1.2 后端依赖安装

在部署前，请确保所有依赖已安装：

```bash
# 在后端目录执行
cd backend
npm install --production
```

## 2. Termux 服务器配置

### 2.1 安装必要软件

```bash
# 更新软件包列表
pkg update

# 安装 Node.js、Nginx 和 MariaDB
pkg install nodejs nginx mariadb

# 启动 MariaDB 服务
pkg install proot
proot -0 mariadb-install-db
proot -0 rc.d start mariadb

# 安装 unzip 用于解压文件
pkg install unzip
```

### 2.2 配置 MariaDB

```bash
# 设置 root 密码
mysqladmin -u root password "your_password"

# 创建数据库
mysql -u root -p -e "CREATE DATABASE blog_db;"
mysql -u root -p -e "CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'user_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON blog_db.* TO 'blog_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

## 3. 部署项目文件

### 3.1 传输文件

使用 SCP 或其他方式将以下文件传输到 Termux 服务器：

- 前端 `dist` 目录
- 后端所有文件

### 3.2 配置环境变量

在后端目录创建 `.env` 文件：

```bash
# .env 文件内容
PORT=3000

# MariaDB 连接信息
DB_HOST=localhost
DB_USER=blog_user
DB_PASSWORD=user_password
DB_NAME=blog_db

# JWT 密钥
JWT_SECRET=your_jwt_secret_key

# 文件上传路径
UPLOAD_PATH=./uploads
```

### 3.3 创建上传目录

```bash
mkdir -p backend/uploads
chmod 775 backend/uploads
```

## 4. 配置 Nginx

### 4.1 创建 Nginx 配置文件

```bash
nano ~/../usr/local/nginx/conf/conf.d/boge.conf
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name localhost;

    # 前端静态文件
    location / {
        root /path/to/boge/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.2 更新 Nginx 主配置

确保主配置文件包含了我们的子配置：

```bash
nano ~/../usr/local/nginx/conf/nginx.conf
```

在 http 块中添加：

```nginx
include conf.d/*.conf;
```

### 4.3 启动 Nginx

```bash
nginx
```

## 5. 启动后端服务

### 5.1 使用 PM2 管理 Node.js 进程（推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
cd backend
pm start

# 或者使用 PM2
pm install -g pm2
pm start
pm list
```

## 6. 测试部署

在浏览器中访问：
- 博格首页：http://服务器IP
- API 接口：http://服务器IP/api/articles

## 7. 常见问题处理

### 7.1 Nginx 无法启动

检查配置文件语法：
```bash
nginx -t
```

### 7.2 后端服务无法连接数据库

检查 `.env` 文件中的数据库配置是否正确，确保 MariaDB 服务已启动。

### 7.3 权限问题

确保上传目录有正确的权限：
```bash
chmod -R 775 backend/uploads
```

## 8. 注意事项

- 定期备份数据库和重要文件
- 生产环境应使用更强的密码和安全措施
- 考虑使用 HTTPS 加密传输