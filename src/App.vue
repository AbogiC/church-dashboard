<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <img
            src="/gki_menteng.jpg"
            alt="GKI Menteng Logo"
            width="30"
            height="30"
            class="d-inline-block align-top me-2"
          />
          GKI Menteng
        </router-link>
        <!-- <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">
                <i class="bi bi-house me-1"></i> Home
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/about">
                <i class="bi bi-info-circle me-1"></i> About
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/management">
                <i class="bi bi-gear me-1"></i> Management
              </router-link>
            </li>
          </ul>
        </div> -->
        <button
          @click="toggleTheme"
          class="btn btn-outline-light ms-3"
          :title="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
        >
          <i :class="theme === 'light' ? 'bi bi-moon-fill' : 'bi bi-sun-fill'"></i>
        </button>
      </div>
    </nav>

    <main class="container mt-4">
      <router-view />
    </main>

    <footer class="mt-5 py-3 border-top">
      <div class="container text-center">
        <p class="mb-0 text-muted">
          © {{ new Date().getFullYear() }} GKI Menteng. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'App',
  setup() {
    const { theme, toggleTheme } = useTheme()
    return {
      theme,
      toggleTheme,
    }
  },
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Zain', sans-serif;
}

main {
  flex: 1;
}

.nav-link.router-link-active {
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
</style>
