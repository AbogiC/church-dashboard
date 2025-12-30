<template>
  <div class="management">
    <h2 class="mb-4">Service Management</h2>

    <div class="row">
      <!-- Services List -->
      <div class="col-md-8">
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
                    <tr v-for="service in services" :key="service.id">
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
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar Preview -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5>This Week's Schedule</h5>
          </div>
          <div class="card-body">
            <div v-if="upcomingServices.length === 0" class="text-muted">No services this week</div>
            <div v-else>
              <div
                v-for="service in upcomingServices"
                :key="service.id"
                class="mb-3 p-2 border rounded"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ service.title }}</strong>
                    <div class="small text-muted">
                      {{ formatServiceDate(service.service_date) }}
                      at {{ formatTime(service.service_time) }}
                    </div>
                  </div>
                  <button
                    @click="viewServiceDetails(service)"
                    class="btn btn-sm btn-outline-primary"
                  >
                    View
                  </button>
                </div>
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
            <h5 class="modal-title">Manage Service: {{ selectedService?.title }}</h5>
            <button type="button" class="btn-close" @click="closeServiceDetails"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedService" class="row">
              <div class="col-md-6">
                <h6>Service Information</h6>
                <p><strong>Date:</strong> {{ formatDate(selectedService.service_date) }}</p>
                <p><strong>Time:</strong> {{ formatTime(selectedService.service_time) }}</p>
                <p><strong>Type:</strong> {{ formatServiceType(selectedService.service_type) }}</p>
                <p><strong>Leader:</strong> {{ selectedService.leader || 'TBD' }}</p>
                <p><strong>Location:</strong> {{ selectedService.location || 'Main Sanctuary' }}</p>
                <p><strong>Description:</strong></p>
                <p>{{ selectedService.description }}</p>
              </div>

              <div class="col-md-6">
                <h6>Volunteers</h6>
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
                  <option value="bible_study">Bible Study</option>
                  <option value="prayer_meeting">Prayer Meeting</option>
                  <option value="special_event">Special Event</option>
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
                <input v-model="serviceForm.location" type="text" class="form-control" />
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
                  <option value="preacher">Preacher</option>
                  <option value="usher">Usher</option>
                  <option value="technical">Technical Team</option>
                  <option value="childrens_ministry">Children's Ministry</option>
                  <option value="prayer_team">Prayer Team</option>
                  <option value="greeter">Greeter</option>
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

export default {
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
        role: 'usher',
        phone: '',
        email: '',
        assigned_date: '',
      },
    }
  },
  async created() {
    await this.loadServices()
  },
  methods: {
    async loadServices() {
      this.loadingServices = true
      try {
        const response = await this.$axios.get('http://localhost:3000/api/services')
        this.services = response.data

        // Get upcoming services (next 7 days)
        const today = format(new Date(), 'yyyy-MM-dd')
        const nextWeek = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        const upcomingResponse = await this.$axios.get(
          `http://localhost:3000/api/services/schedule/${today}/${nextWeek}`,
        )
        this.upcomingServices = upcomingResponse.data
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
        const response = await this.$axios.get(
          `http://localhost:3000/api/volunteers/service/${serviceId}`,
        )
        this.volunteers = response.data
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
          await this.$axios.put(
            `http://localhost:3000/api/services/${this.editingService.id}`,
            this.serviceForm,
          )
        } else {
          await this.$axios.post('http://localhost:3000/api/services', this.serviceForm)
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
          await this.$axios.delete(`http://localhost:3000/api/services/${id}`)
          await this.loadServices()
        } catch (error) {
          console.error('Error deleting service:', error)
        }
      }
    },

    async saveVolunteer() {
      try {
        this.volunteerForm.service_id = this.selectedService.id
        await this.$axios.post('http://localhost:3000/api/volunteers', this.volunteerForm)
        this.closeVolunteerModal()
        await this.loadVolunteers(this.selectedService.id)
      } catch (error) {
        console.error('Error saving volunteer:', error)
      }
    },

    async updateVolunteerStatus(volunteerId, status) {
      try {
        await this.$axios.put(`http://localhost:3000/api/volunteers/${volunteerId}/status`, {
          status,
        })
        await this.loadVolunteers(this.selectedService.id)
      } catch (error) {
        console.error('Error updating volunteer status:', error)
      }
    },

    async removeVolunteer(volunteerId) {
      if (confirm('Are you sure you want to remove this volunteer?')) {
        try {
          await this.$axios.delete(`http://localhost:3000/api/volunteers/${volunteerId}`)
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
        bible_study: 'bg-success',
        prayer_meeting: 'bg-info',
        special_event: 'bg-warning',
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
  },
}
</script>

<style scoped>
.volunteer-item {
  background-color: #f8f9fa;
}

.volunteer-item:hover {
  background-color: #e9ecef;
}

.table th {
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}
</style>
