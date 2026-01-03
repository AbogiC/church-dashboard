<template>
  <div class="management">
    <h2 class="mb-4">Service Management</h2>

    <!-- Service Calendar -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5>Service Calendar</h5>
          </div>
          <div class="card-body">
            <FullCalendar :options="calendarOptions" />
          </div>
        </div>
      </div>
    </div>

    <!-- Services List -->
    <div class="row">
      <div class="col-12">
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h4>Sunday Services</h4>
            <button @click="showServiceModal = true" class="btn btn-primary">
              Add New Service
            </button>
          </div>
          <div class="card-body">
            <div v-if="loadingServices" class="text-center">
              <div class="spinner-border"></div>
            </div>
            <div v-else-if="services.length === 0" class="text-center text-muted">
              No services scheduled
            </div>
            <div v-else>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Service Type</th>
                      <th>Title</th>
                      <th>Leader</th>
                      <th>Volunteers</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="service in paginatedServices" :key="service.id">
                      <td>{{ formatDate(service.service_date) }}</td>
                      <td>{{ formatTime(service.service_time) }}</td>
                      <td>
                        <span class="badge" :class="getServiceTypeClass(service.service_type)">
                          {{ formatServiceType(service.service_type) }}
                        </span>
                      </td>
                      <td>{{ service.title }}</td>
                      <td>{{ service.leader || 'TBD' }}</td>
                      <td>
                        <span class="badge bg-info">
                          {{ service.volunteer_count || 0 }}
                        </span>
                      </td>
                      <td>
                        <div style="display: flex">
                          <button
                            @click="viewServiceDetails(service)"
                            class="btn btn-sm btn-outline-primary me-2"
                          >
                            Manage
                          </button>
                          <button
                            @click="editService(service)"
                            class="btn btn-sm btn-outline-secondary me-2"
                          >
                            Edit
                          </button>
                          <button
                            @click="deleteService(service.id)"
                            class="btn btn-sm btn-outline-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination Controls -->
              <div
                class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mt-3 gap-2 gap-md-0"
              >
                <div
                  class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-md-3 w-100 w-md-auto"
                >
                  <div class="text-muted small">
                    <span class="d-inline d-md-none">Showing </span>
                    <span class="d-none d-md-inline">Showing </span>
                    {{ (currentPage - 1) * itemsPerPage + 1 }}-
                    {{ Math.min(currentPage * itemsPerPage, services.length) }} of
                    {{ services.length }} services
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <label class="form-label mb-0 text-muted small d-none d-sm-inline">Show:</label>
                    <select
                      v-model="itemsPerPage"
                      @change="changeItemsPerPage"
                      class="form-select form-select-sm"
                      style="width: auto; min-width: 60px"
                    >
                      <option :value="5">5</option>
                      <option :value="10">10</option>
                      <option :value="20">20</option>
                      <option :value="50">50</option>
                    </select>
                    <span class="text-muted small d-none d-sm-inline">per page</span>
                  </div>
                </div>
                <nav class="d-flex justify-content-center justify-content-md-end">
                  <ul class="pagination pagination-sm mb-0">
                    <li
                      class="page-item d-none d-sm-inline"
                      :class="{ disabled: currentPage === 1 }"
                    >
                      <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)"
                        >Previous</a
                      >
                    </li>
                    <li class="page-item d-sm-none" :class="{ disabled: currentPage === 1 }">
                      <a class="page-link px-2" href="#" @click.prevent="goToPage(currentPage - 1)"
                        >‹</a
                      >
                    </li>
                    <li
                      v-for="page in visiblePages"
                      :key="page"
                      class="page-item"
                      :class="{ active: page === currentPage }"
                    >
                      <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                    </li>
                    <li
                      class="page-item d-none d-sm-inline"
                      :class="{ disabled: currentPage === totalPages }"
                    >
                      <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)"
                        >Next</a
                      >
                    </li>
                    <li
                      class="page-item d-sm-none"
                      :class="{ disabled: currentPage === totalPages }"
                    >
                      <a class="page-link px-2" href="#" @click.prevent="goToPage(currentPage + 1)"
                        >›</a
                      >
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Service Details Modal -->
    <div v-if="showServiceDetails" class="modal fade show" style="display: block">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedService?.title }}</h5>
            <button type="button" class="btn-close" @click="closeServiceDetails"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedService" class="row">
              <div class="col-md-6">
                <h6>
                  <strong><u>Service Information</u></strong>
                </h6>
                <p>
                  <strong><em>Date:</em></strong> {{ formatDate(selectedService.service_date) }}
                </p>
                <p>
                  <strong><em>Time:</em></strong> {{ formatTime(selectedService.service_time) }}
                </p>
                <p>
                  <strong><em>Type:</em></strong>
                  {{ formatServiceType(selectedService.service_type) }}
                </p>
                <p>
                  <strong><em>Leader:</em></strong> {{ selectedService.leader || 'TBD' }}
                </p>
                <p>
                  <strong><em>Location:</em></strong>
                  {{ selectedService.location || 'Main Sanctuary' }}
                </p>
                <p>
                  <strong><em>Description:</em></strong>
                </p>
                <p>{{ selectedService.description }}</p>
              </div>

              <div class="col-md-6">
                <h6><u>Volunteers</u></h6>
                <div class="mb-3">
                  <button @click="showVolunteerModal = true" class="btn btn-sm btn-primary">
                    Add Volunteer
                  </button>
                </div>

                <div v-if="loadingVolunteers" class="text-center">
                  <div class="spinner-border spinner-border-sm"></div>
                </div>
                <div v-else-if="volunteers.length === 0" class="text-muted">
                  No volunteers assigned
                </div>
                <div v-else>
                  <div
                    v-for="volunteer in volunteers"
                    :key="volunteer.id"
                    class="volunteer-item mb-2 p-2 border rounded"
                  >
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{{ volunteer.full_name }}</strong>
                        <div class="small">
                          <span class="badge bg-secondary me-2">
                            {{ formatRole(volunteer.role) }}
                          </span>
                          <span class="badge" :class="getStatusClass(volunteer.status)">
                            {{ volunteer.status }}
                          </span>
                        </div>
                      </div>
                      <div>
                        <button
                          @click="updateVolunteerStatus(volunteer.id, 'confirmed')"
                          class="btn btn-sm btn-success me-1"
                          :disabled="volunteer.status === 'confirmed'"
                        >
                          ✓
                        </button>
                        <button
                          @click="updateVolunteerStatus(volunteer.id, 'unavailable')"
                          class="btn btn-sm btn-warning me-1"
                          :disabled="volunteer.status === 'unavailable'"
                        >
                          ✗
                        </button>
                        <button
                          @click="removeVolunteer(volunteer.id)"
                          class="btn btn-sm btn-danger"
                        >
                          🗑
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
    </div>
    <div v-if="showServiceDetails" class="modal-backdrop fade show"></div>

    <!-- Add/Edit Service Modal -->
    <div v-if="showServiceModal" class="modal fade show" style="display: block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingService ? 'Edit Service' : 'Add New Service' }}</h5>
            <button type="button" class="btn-close" @click="closeServiceModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveService">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Service Date</label>
                  <input
                    v-model="serviceForm.service_date"
                    type="date"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Service Time</label>
                  <input
                    v-model="serviceForm.service_time"
                    type="time"
                    class="form-control"
                    required
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Service Type</label>
                <select v-model="serviceForm.service_type" class="form-select" required>
                  <option value="sunday_service">Sunday Service</option>
                  <option value="rehearsal">Rehearsal</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Title</label>
                <input v-model="serviceForm.title" type="text" class="form-control" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea
                  v-model="serviceForm.description"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Leader</label>
                <input v-model="serviceForm.leader" type="text" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Location</label>
                <select v-model="serviceForm.location" class="form-select" required>
                  <option value="Ruang Ibadah">Ruang Ibadah</option>
                  <option value="Ruang Serbaguna">Ruang Serbaguna</option>
                  <option value="Betlehem">Betlehem</option>
                  <option value="Nazareth">Nazareth</option>
                  <option value="Yerusalem">Yerusalem</option>
                </select>
              </div>

              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeServiceModal">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                  {{ editingService ? 'Update' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showServiceModal" class="modal-backdrop fade show"></div>

    <!-- Add Volunteer Modal -->
    <div v-if="showVolunteerModal" class="modal fade show" style="display: block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add Volunteer to Service</h5>
            <button type="button" class="btn-close" @click="closeVolunteerModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveVolunteer">
              <div class="mb-3">
                <label class="form-label">Full Name</label>
                <input
                  v-model="volunteerForm.full_name"
                  type="text"
                  class="form-control"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Role</label>
                <select v-model="volunteerForm.role" class="form-select" required>
                  <option value="worship_leader">Worship Leader</option>
                  <option value="musician">Musician</option>
                  <option value="soundman">Soundman</option>
                </select>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Phone</label>
                  <input v-model="volunteerForm.phone" type="tel" class="form-control" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Email</label>
                  <input v-model="volunteerForm.email" type="email" class="form-control" />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Assigned Date</label>
                <input
                  v-model="volunteerForm.assigned_date"
                  type="date"
                  class="form-control"
                  required
                />
              </div>

              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeVolunteerModal">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">Add Volunteer</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showVolunteerModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { format } from 'date-fns'
import apiService from '@/services/api.js'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

export default {
  components: {
    FullCalendar,
  },
  name: 'ManagementView',
  data() {
    return {
      services: [],
      upcomingServices: [],
      volunteers: [],
      loadingServices: false,
      loadingVolunteers: false,
      showServiceModal: false,
      showServiceDetails: false,
      showVolunteerModal: false,
      selectedService: null,
      editingService: null,
      calendarEvents: [],
      currentPage: 1,
      itemsPerPage: 10,
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        events: [],
        eventClick: this.handleEventClick,
        height: 'auto',
        headerToolbar: {
          left: 'title',
          right: 'prev,today,next',
        },
        buttonText: {
          today: '📅', // Customize the "Today" button text if needed
        },

        // Set global time format
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false, // Change to false for 24-hour format
        },
      },

      serviceForm: {
        service_date: '',
        service_time: '',
        service_type: 'sunday_service',
        title: '',
        description: '',
        leader: '',
        location: '',
      },
      volunteerForm: {
        service_id: null,
        full_name: '',
        role: 'worship_leader',
        phone: '',
        email: '',
        assigned_date: '',
      },
    }
  },
  computed: {
    paginatedServices() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.services.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.services.length / this.itemsPerPage)
    },
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    },
  },
  async created() {
    await this.loadServices()
  },
  methods: {
    async loadServices() {
      this.loadingServices = true
      try {
        this.services = await apiService.getServices()
        this.currentPage = 1 // Reset to first page when services are loaded

        // Set calendar events
        this.calendarEvents = this.services.map((service) => {
          console.log(`\n=== Processing: ${service.title} ===`)
          console.log('Original service_date (UTC):', service.service_date)
          console.log('Original service_time (local?):', service.service_time)

          // Parse the UTC date
          const utcDate = new Date(service.service_date)
          console.log('UTC Date object:', utcDate.toISOString())
          console.log('UTC Date local string:', utcDate.toString())

          // Get the local date portion (based on browser's timezone)
          const localYear = utcDate.getFullYear()
          const localMonth = String(utcDate.getMonth() + 1).padStart(2, '0')
          const localDay = String(utcDate.getDate()).padStart(2, '0')
          const localDateStr = `${localYear}-${localMonth}-${localDay}`

          console.log('Local date (YYYY-MM-DD):', localDateStr)

          // Combine with the service_time
          const combinedDateTime = `${localDateStr}T${service.service_time}`
          console.log('Combined date-time:', combinedDateTime)

          return {
            title: service.title,
            date: combinedDateTime,
            extendedProps: { service },
          }
        })

        this.calendarOptions.events = this.calendarEvents

        // Get upcoming services (next 7 days)
        const today = format(new Date(), 'yyyy-MM-dd')
        const nextWeek = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        this.upcomingServices = await apiService.getServicesSchedule(today, nextWeek)
      } catch (error) {
        console.error('Error loading services:', error)
      } finally {
        this.loadingServices = false
      }
    },

    async viewServiceDetails(service) {
      this.selectedService = service
      this.showServiceDetails = true
      await this.loadVolunteers(service.id)
    },

    async loadVolunteers(serviceId) {
      this.loadingVolunteers = true
      try {
        this.volunteers = await apiService.getVolunteersByService(serviceId)
      } catch (error) {
        console.error('Error loading volunteers:', error)
      } finally {
        this.loadingVolunteers = false
      }
    },

    editService(service) {
      this.editingService = service
      this.serviceForm = { ...service }
      this.showServiceModal = true
    },

    async saveService() {
      try {
        if (this.editingService) {
          await apiService.updateService(this.editingService.id, this.serviceForm)
        } else {
          await apiService.createService(this.serviceForm)
        }
        this.closeServiceModal()
        await this.loadServices()
      } catch (error) {
        console.error('Error saving service:', error)
      }
    },

    async deleteService(id) {
      if (
        confirm(
          'Are you sure you want to delete this service? This will also remove all volunteers.',
        )
      ) {
        try {
          await apiService.deleteService(id)
          await this.loadServices()
        } catch (error) {
          console.error('Error deleting service:', error)
        }
      }
    },

    async saveVolunteer() {
      try {
        this.volunteerForm.service_id = this.selectedService.id
        await apiService.createVolunteer(this.volunteerForm)
        this.closeVolunteerModal()
        await this.loadVolunteers(this.selectedService.id)
      } catch (error) {
        console.error('Error saving volunteer:', error)
      }
    },

    async updateVolunteerStatus(volunteerId, status) {
      try {
        await apiService.updateVolunteerStatus(volunteerId, status)
        await this.loadVolunteers(this.selectedService.id)
      } catch (error) {
        console.error('Error updating volunteer status:', error)
      }
    },

    async removeVolunteer(volunteerId) {
      if (confirm('Are you sure you want to remove this volunteer?')) {
        try {
          await apiService.deleteVolunteer(volunteerId)
          await this.loadVolunteers(this.selectedService.id)
        } catch (error) {
          console.error('Error removing volunteer:', error)
        }
      }
    },

    closeServiceModal() {
      this.showServiceModal = false
      this.editingService = null
      this.serviceForm = {
        service_date: '',
        service_time: '',
        service_type: 'sunday_service',
        title: '',
        description: '',
        leader: '',
        location: '',
      }
    },

    closeServiceDetails() {
      this.showServiceDetails = false
      this.selectedService = null
      this.volunteers = []
    },

    closeVolunteerModal() {
      this.showVolunteerModal = false
      this.volunteerForm = {
        service_id: null,
        full_name: '',
        role: 'usher',
        phone: '',
        email: '',
        assigned_date: '',
      }
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

    formatServiceType(type) {
      return type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },

    getServiceTypeClass(type) {
      const classes = {
        sunday_service: 'bg-primary',
        rehearsal: 'bg-success',
      }
      return classes[type] || 'bg-secondary'
    },

    formatRole(role) {
      return role
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    },

    getStatusClass(status) {
      const classes = {
        confirmed: 'bg-success',
        pending: 'bg-warning',
        unavailable: 'bg-danger',
      }
      return classes[status] || 'bg-secondary'
    },

    handleEventClick(info) {
      this.viewServiceDetails(info.event.extendedProps.service)
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },

    changeItemsPerPage() {
      this.currentPage = 1 // Reset to first page when items per page changes
    },
  },
}
</script>

<style scoped>
.volunteer-item:hover {
  transform: scale(1.03);
}

.table th {
  font-weight: 600;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>
