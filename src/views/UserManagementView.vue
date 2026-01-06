<template>
  <div class="user-management">
    <h2 class="mb-4">User Management</h2>

    <div class="row mb-4">
      <div class="col-12">
        <button @click="openAddModal" class="btn btn-primary">Add New User</button>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5>Registered Users</h5>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center">
              <div class="spinner-border"></div>
            </div>
            <div v-else-if="users.length === 0" class="text-center text-muted">No users found</div>
            <div v-else>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in users" :key="user.id">
                      <td>{{ user.email }}</td>
                      <td>
                        <span class="badge" :class="getRoleClass(user.role)">
                          {{ user.role }}
                        </span>
                      </td>
                      <td>{{ formatDate(user.created_at) }}</td>
                      <td>
                        <button
                          @click="openEditModal(user)"
                          class="btn btn-sm btn-outline-secondary me-2"
                        >
                          Edit
                        </button>
                        <button @click="deleteUser(user.id)" class="btn btn-sm btn-outline-danger">
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
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showModal" class="modal fade show" style="display: block">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingUser ? 'Edit User' : 'Add New User' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="userForm.email" type="email" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Role</label>
                <select v-model="userForm.role" class="form-select" required>
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeModal">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import apiService from '../services/api.js'

export default {
  name: 'UserManagementView',
  data() {
    return {
      users: [],
      loading: false,
      showModal: false,
      editingUser: null,
      userForm: {
        email: '',
        role: 'user',
      },
    }
  },
  async created() {
    await this.loadUsers()
  },
  methods: {
    async loadUsers() {
      this.loading = true
      try {
        this.users = await apiService.getUsers()
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        this.loading = false
      }
    },
    async updateRole(userId, newRole) {
      try {
        await apiService.updateUserRole(userId, newRole)
        // Update local data
        const user = this.users.find((u) => u.id === userId)
        if (user) {
          user.role = newRole
        }
      } catch (error) {
        console.error('Error updating user role:', error)
        alert('Failed to update role')
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    getRoleClass(role) {
      const classes = {
        admin: 'bg-danger',
        moderator: 'bg-warning',
        user: 'bg-primary',
      }
      return classes[role] || 'bg-secondary'
    },
    openAddModal() {
      this.editingUser = null
      this.userForm = { email: '', role: 'user' }
      this.showModal = true
    },
    openEditModal(user) {
      this.editingUser = user
      this.userForm = { email: user.email, role: user.role }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.editingUser = null
      this.userForm = { email: '', role: 'user' }
    },
    async saveUser() {
      try {
        if (this.editingUser) {
          await apiService.updateUser(this.editingUser.id, this.userForm)
        } else {
          await apiService.createUser({
            email: this.userForm.email,
            role: this.userForm.role,
          })
        }
        this.closeModal()
        await this.loadUsers()
      } catch (error) {
        console.error('Error saving user:', error)
        alert('Failed to save user')
      }
    },
    async deleteUser(userId) {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await apiService.deleteUser(userId)
          await this.loadUsers()
        } catch (error) {
          console.error('Error deleting user:', error)
          alert('Failed to delete user')
        }
      }
    },
  },
}
</script>

<style scoped>
.user-management {
  padding: 20px;
}
</style>
