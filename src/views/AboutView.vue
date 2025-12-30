<template>
  <div class="about">
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3>About Our Church</h3>
            <button v-if="isAdmin" @click="editAbout" class="btn btn-primary">
              Edit About Page
            </button>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              <div class="spinner-border"></div>
            </div>
            <div v-else>
              <div v-for="section in aboutSections" :key="section.id" class="about-section mb-5">
                <h4 class="mb-3">{{ section.title }}</h4>
                <div class="row align-items-center">
                  <div v-if="section.image_url" class="col-md-6 mb-3">
                    <img :src="section.image_url" :alt="section.title" class="img-fluid rounded" />
                  </div>
                  <div :class="section.image_url ? 'col-md-6' : 'col-12'">
                    <p class="about-content">{{ section.content }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'AboutView',
  data() {
    return {
      aboutSections: [],
      loading: false,
      isAdmin: true,
    }
  },
  async created() {
    await this.loadAbout()
  },
  methods: {
    async loadAbout() {
      this.loading = true
      try {
        const response = await axios.get('/about')
        this.aboutSections = response.data
      } catch (error) {
        console.error('Error loading about:', error)
      } finally {
        this.loading = false
      }
    },
    editAbout() {
      // Implement edit functionality
      alert('Edit about page functionality would go here')
    },
  },
}
</script>

<style scoped>
.about-section {
  border-bottom: 1px solid #eee;
  padding-bottom: 2rem;
}

.about-section:last-child {
  border-bottom: none;
}

.about-content {
  line-height: 1.8;
  font-size: 1.1rem;
  white-space: pre-line;
}
</style>
