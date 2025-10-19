<template>
  <div class="user-auth-overlay" @click="handleOverlayClick">
    <div class="user-auth-container" @click.stop>
      <div class="auth-header">
        <h2>{{ isRegister ? '用户注册' : '用户登录' }}</h2>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="auth-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="formData.username" 
            placeholder="请输入用户名"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="formData.password" 
            placeholder="请输入密码"
          />
        </div>
        
        <button class="auth-button" @click="handleSubmit">
          {{ isRegister ? '注册' : '登录' }}
        </button>
        
        <div class="auth-footer">
          <span @click="toggleMode" class="switch-mode">
            {{ isRegister ? '已有账号？立即登录' : '还没有账号？立即注册' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserAuth',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isRegister: false,
      formData: {
        username: '',
        password: ''
      },
      error: ''
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        // 重置表单
        this.resetForm();
      }
    }
  },
  methods: {
    toggleMode() {
      this.isRegister = !this.isRegister;
      this.resetForm();
    },
    resetForm() {
      this.formData = {
        username: '',
        password: ''
      };
      this.error = '';
    },
    handleClose() {
      this.$emit('close');
    },
    handleOverlayClick() {
      this.handleClose();
    },
    async handleSubmit() {
      // 表单验证
      if (!this.formData.username || !this.formData.password) {
        this.error = '请填写用户名和密码';
        return;
      }
      
      if (this.formData.username.length < 3) {
        this.error = '用户名长度至少为3个字符';
        return;
      }
      
      if (this.formData.password.length < 4) {
        this.error = '密码长度至少为4个字符';
        return;
      }
      
      try {
        // 从localStorage加载用户列表
        const storedUsers = localStorage.getItem('normalUsers');
        let users = [];
        
        if (storedUsers) {
          users = JSON.parse(storedUsers);
        }
        
        if (this.isRegister) {
          // 注册逻辑
          if (users.some(user => user.username === this.formData.username)) {
            this.error = '用户名已存在';
            return;
          }
          
          // 添加新用户
          users.push({
            username: this.formData.username,
            password: this.formData.password
          });
          
          // 保存到localStorage
          localStorage.setItem('normalUsers', JSON.stringify(users));
          
          // 注册成功后自动登录
          localStorage.setItem('userLoggedIn', 'true');
          localStorage.setItem('username', this.formData.username);
          
          this.$emit('login-success', this.formData.username);
          this.handleClose();
        } else {
          // 登录逻辑
          // 先检查用户是否存在（不验证密码，只为了判断账户是否被删除）
          const userExists = users.some(u => u.username === this.formData.username);
          
          if (!userExists) {
            // 用户不存在，显示账户被注销的提示
            this.error = '你的账户因违反网站安全管理条例而注销，请重新注册';
            return;
          }
          
          // 用户存在，验证密码
          const user = users.find(u => u.username === this.formData.username && u.password === this.formData.password);
          
          if (!user) {
            this.error = '用户名或密码错误';
            return;
          }
          
          // 保存登录状态
          localStorage.setItem('userLoggedIn', 'true');
          localStorage.setItem('username', this.formData.username);
          
          this.$emit('login-success', this.formData.username);
          this.handleClose();
        }
      } catch (err) {
        this.error = '操作失败，请重试';
        console.error(err);
      }
    }
  }
}
</script>

<style scoped>
.user-auth-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.user-auth-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.auth-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.auth-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary, #4CAF50);
}

.auth-button {
  width: 100%;
  padding: 12px;
  background-color: var(--primary, #4CAF50);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.auth-button:hover {
  background-color: var(--primary-hover, #45a049);
}

.auth-footer {
  text-align: center;
  margin-top: 16px;
}

.switch-mode {
  color: var(--primary, #4CAF50);
  cursor: pointer;
  font-size: 14px;
}

.switch-mode:hover {
  text-decoration: underline;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 10px 15px;
  margin: 10px 20px;
  border-radius: 4px;
  font-size: 14px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>