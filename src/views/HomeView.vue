<template>
  <div class="home">
    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3>Latest News & Updates</h3>
            <button v-if="isAdmin" @click="showNewsModal = true" class="btn btn-primary">
              Add News
            </button>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              <div class="spinner-border"></div>
            </div>
            <div v-else-if="news.length === 0" class="text-center text-muted">
              No news available
            </div>
            <div v-else class="news-list">
              <div v-for="item in news" :key="item.id" class="news-item mb-4">
                <div class="card">
                  <div v-if="item.image_url" class="card-img-top-container">
                    <img :src="item.image_url" class="card-img-top" :alt="item.title" />
                  </div>
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                      <h5 class="card-title">{{ item.title }}</h5>
                      <span class="badge" :class="getCategoryClass(item.category)">
                        {{ formatCategory(item.category) }}
                      </span>
                    </div>
                    <p class="card-text">{{ truncateContent(item.content, 150) }}</p>
                    <div class="d-flex justify-content-between align-items-center">
                      <small class="text-muted">{{ formatDate(item.created_at) }}</small>
                      <div v-if="isAdmin">
                        <button @click="editNews(item)" class="btn btn-sm btn-outline-primary me-2">
                          Edit
                        </button>
                        <button @click="deleteNews(item.id)" class="btn btn-sm btn-outline-danger">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card mb-4">
          <div class="card-header">
            <h5>Upcoming Services</h5>
          </div>
          <div class="card-body">
            <div v-if="upcomingServices.length === 0" class="text-muted">No upcoming services</div>
            <div v-else>
              <div v-for="service in upcomingServices" :key="service.id" class="mb-3">
                <h6>{{ service.title }}</h6>
                <p class="mb-1">
                  <i class="bi bi-calendar"></i>
                  {{ formatServiceDate(service.service_date) }}
                  at {{ formatTime(service.service_time) }}
                </p>
                <p class="mb-1">
                  <small>Leader: {{ service.leader || 'TBD' }}</small>
                </p>
                <p class="mb-0">
                  <small>Volunteers: {{ service.volunteer_count || 0 }}</small>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h5>Quick Stats</h5>
          </div>
          <div class="card-body">
            <div class="row text-center">
              <div class="col-6 mb-3">
                <div class="stat-number">{{ news.length }}</div>
                <div class="stat-label">News Items</div>
              </div>
              <div class="col-6 mb-3">
                <div class="stat-number">{{ upcomingServices.length }}</div>
                <div class="stat-label">Upcoming Services</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- News Modal -->
    <div v-if="showNewsModal" class="modal fade show" style="display: block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingNews ? 'Edit News' : 'Add News' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveNews">
              <div class="mb-3">
                <label class="form-label">Title</label>
                <input v-model="newsForm.title" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Category</label>
                <select v-model="newsForm.category" class="form-select" required>
                  <option value="announcement">Announcement</option>
                  <option value="event">Event</option>
                  <option value="testimony">Testimony</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Content</label>
                <textarea
                  v-model="newsForm.content"
                  class="form-control"
                  rows="5"
                  required
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Image URL (Optional)</label>
                <input v-model="newsForm.image_url" type="text" class="form-control" />
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeModal">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ editingNews ? 'Update' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showNewsModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { format } from 'date-fns'

export default {
  name: 'HomeView',
  data() {
    return {
      news: [],
      upcomingServices: [],
      loading: false,
      showNewsModal: false,
      editingNews: null,
      newsForm: {
        title: '',
        content: '',
        category: 'general',
        image_url: '',
      },
      isAdmin: true, // In real app, get from auth
    }
  },
  async created() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        // Load news
        const newsResponse = await this.$axios.get('http://localhost:3000/api/news')
        this.news = newsResponse.data

        // Load upcoming services (next 7 days)
        const today = format(new Date(), 'yyyy-MM-dd')
        const nextWeek = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        const servicesResponse = await this.$axios.get(
          `http://localhost:3000/api/services/schedule/${today}/${nextWeek}`,
        )
        this.upcomingServices = servicesResponse.data
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        this.loading = false
      }
    },

    getCategoryClass(category) {
      const classes = {
        announcement: 'bg-primary',
        event: 'bg-success',
        testimony: 'bg-warning',
        general: 'bg-secondary',
      }
      return classes[category] || 'bg-secondary'
    },

    formatCategory(category) {
      return category.charAt(0).toUpperCase() + category.slice(1)
    },

    truncateContent(text, length) {
      return text.length > length ? text.substring(0, length) + '...' : text
    },

    formatDate(dateString) {
      return format(new Date(dateString), 'MMM dd, yyyy')
    },

    formatServiceDate(dateString) {
      return format(new Date(dateString), 'EEE, MMM dd')
    },

    formatTime(timeString) {
      return format(new Date(`2000-01-01T${timeString}`), 'h:mm a')
    },

    editNews(item) {
      this.editingNews = item
      this.newsForm = { ...item }
      this.showNewsModal = true
    },

    async saveNews() {
      try {
        if (this.editingNews) {
          await this.$axios.put(
            `http://localhost:3000/api/news/${this.editingNews.id}`,
            this.newsForm,
          )
        } else {
          await this.$axios.post('http://localhost:3000/api/news', this.newsForm)
        }
        this.closeModal()
        await this.loadData()
      } catch (error) {
        console.error('Error saving news:', error)
      }
    },

    async deleteNews(id) {
      if (confirm('Are you sure you want to delete this news item?')) {
        try {
          await this.$axios.delete(`http://localhost:3000/api/news/${id}`)
          await this.loadData()
        } catch (error) {
          console.error('Error deleting news:', error)
        }
      }
    },

    closeModal() {
      this.showNewsModal = false
      this.editingNews = null
      this.newsForm = {
        title: '',
        content: '',
        category: 'general',
        image_url: '',
      }
    },
  },
}
</script>

<style scoped>
.news-item .card {
  transition: transform 0.2s;
}

.news-item .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-img-top-container {
  height: 200px;
  overflow: hidden;
}

.card-img-top {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>
