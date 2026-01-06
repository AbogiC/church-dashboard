<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" placeholder="Enter your email" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter your password"
          required
        />
      </div>
      <button type="submit" :disabled="loading">Login</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
    <router-link to="/register">Don't have an account? Register here</router-link>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuth } from '../auth/useAuth'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginView',
  setup() {
    const { signIn } = useAuth()
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      loading.value = true
      error.value = ''
      try {
        await signIn(email.value, password.value)
        router.push('/')
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    return { email, password, error, loading, handleLogin }
  },
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
