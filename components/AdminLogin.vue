<template>
  <div class="admin-login-container">
    <div class="login-form" @keyup.esc="handleEscape" style="position: relative; z-index: 1;">
      <div class="login-header">
        <div class="logo">
          <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
          <span>Boge</span>
        </div>
        <h2>网站管理控制端</h2>
      </div>
      
      <!-- 错误提示将通过弹窗显示 -->
      
      <div class="form-group">
        <label for="username">用户名</label>
        <div class="input-wrapper">
          <i class="fa fa-user" aria-hidden="true"></i>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            placeholder="请输入用户名"
            @keyup.enter="handleLogin"
            @focus="focusedField = 'username'"
            @blur="focusedField = ''"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <div class="input-wrapper">
          <i class="fa fa-lock" aria-hidden="true"></i>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
            @focus="focusedField = 'password'"
            @blur="focusedField = ''"
          />
        </div>
      </div>
      
      <button 
        class="login-button" 
        @click="handleLogin" 
        :disabled="isLoading"
        :class="{ 'loading': isLoading }"
      >
        <i v-if="isLoading" class="fa fa-spinner fa-spin" aria-hidden="true"></i>
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
      
      <!-- 非管理员用户权限提示将通过弹窗显示 -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLogin',
  data() {
    return {
      username: '',
      password: '',
      isLoading: false,
      focusedField: ''
    }
  },
  mounted() {
    // 检查用户是否已登录为管理员
    const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (adminLoggedIn) {
      this.$router.push('/admin/dashboard');
    }
    
    // 检查当前登录用户是否为普通用户，并且仅在showPermissionAlert为true时才显示提示
    // 移除hasShownPermissionAlert检查，确保每次进入都显示提示
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    
    if (userLoggedIn && this.showPermissionAlert) {
      setTimeout(() => {
        alert('你没有管理权限');
      }, 500);
    }
  },
  props: {
    // 允许从父组件传入showPermissionAlert属性来控制是否显示权限提示
    showPermissionAlert: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    async handleLogin() {
      // 简单的表单验证
      if (!this.username || !this.password) {
        alert('请输入用户名和密码');
        return;
      }

      this.isLoading = true;

      try {
          // 实际项目中应该调用后端API进行身份验证
          // 这里从localStorage加载用户列表进行身份验证
          let isValid = false;
          let role = '';
          
          // 从localStorage加载用户列表
          const storedUsers = localStorage.getItem('adminUsers');
          let users = [];
          
          if (storedUsers) {
            try {
              users = JSON.parse(storedUsers);
            } catch (error) {
              console.error('解析用户列表失败:', error);
            }
          }
          
          // 如果localStorage中没有用户列表，使用默认用户
          if (users.length === 0) {
            users = [
              { username: 'superadmin', role: 'super_admin' },
              { username: 'admin', role: 'admin' }
            ];
          }
          
          // 查找用户并验证密码
          const user = users.find(u => u.username === this.username);
          if (user) {
            // 获取用户密码（在实际项目中应该从后端验证）
            // 这里简化处理，默认密码为'admin'或从localStorage获取的密码
            const userPassword = localStorage.getItem(`password_${user.username}`) || 'admin';
            
            if (this.password === userPassword) {
              isValid = true;
              role = user.role;
            }
          }
          
          if (isValid) {
            // 保存登录状态和角色信息到localStorage
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminRole', role);
            localStorage.setItem('adminUsername', this.username);
            // 通知父组件登录成功
            this.$emit('login-success');
          } else {
            throw new Error('用户名或密码错误');
          }
      } catch (err) {
        alert(err.message || '登录失败，请重试');
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
/* 主界面色系：background-color: #f9fafb; color: #1f2937; */

.admin-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(to bottom right, #ebf4ff, #eef2ff);
  font-family: 'Inter', system-ui, sans-serif;
  position: relative;
  overflow: hidden;
}

.admin-login-container::before {
  content: '';
  position: absolute;
  top: -20%;
  left: -20%;
  width: 40%;
  height: 40%;
  border-radius: 50%;
  background-color: rgba(76, 175, 80, 0.1);
  z-index: 0;
}

.admin-login-container::after {
  content: '';
  position: absolute;
  bottom: -20%;
  right: -20%;
  width: 40%;
  height: 40%;
  border-radius: 50%;
  background-color: rgba(99, 102, 241, 0.1);
  z-index: 0;
}

.login-form {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 450px;
  transform: translateY(0);
  animation: fadeInUp 0.5s ease-out;
  transition: box-shadow 0.3s ease;
}

.login-form:hover {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 15px;
}

.logo i {
  color: var(--primary, #4CAF50); /* 使用主色调 */
}

.login-form h2 {
  color: #1f2937;
  font-weight: 600;
  font-size: 22px;
  margin: 0;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 16px;
  transition: color 0.3s ease;
}

.form-group input {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  background-color: #ffffff;
  color: #1f2937;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary, #4CAF50);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  background-color: #ffffff;
}

.form-group input:focus + i,
.form-group input:focus ~ i {
  color: var(--primary, #4CAF50);
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: var(--primary, #4CAF50);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  background-color: var(--primary-hover, #45a049);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.login-button.loading {
  opacity: 0.8;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
}

.hint {
  font-size: 13px;
  color: #6b7280;
  display: block;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-form {
    padding: 30px 25px;
    border-radius: 10px;
  }
  
  .logo {
    font-size: 22px;
  }
  
  .login-form h2 {
    font-size: 20px;
  }
}
</style>