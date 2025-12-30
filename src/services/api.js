import axios from 'axios'
import { db } from '../firebase.js'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'

const isProduction = import.meta.env.VITE_ENV === 'production'

class ApiService {
  constructor() {
    if (!isProduction) {
      this.client = axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
      })
    }
  }

  // Services
  async getServices() {
    if (isProduction) {
      const servicesCol = collection(db, 'services')
      const servicesSnapshot = await getDocs(servicesCol)
      return servicesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } else {
      const response = await this.client.get('/services')
      return response.data
    }
  }

  async getServicesSchedule(startDate, endDate) {
    if (isProduction) {
      const servicesCol = collection(db, 'services')
      const q = query(
        servicesCol,
        where('service_date', '>=', startDate),
        where('service_date', '<=', endDate),
        orderBy('service_date'),
      )
      const servicesSnapshot = await getDocs(q)
      return servicesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } else {
      const response = await this.client.get(`/services/schedule/${startDate}/${endDate}`)
      return response.data
    }
  }

  async createService(serviceData) {
    if (isProduction) {
      const docRef = await addDoc(collection(db, 'services'), serviceData)
      return { id: docRef.id, ...serviceData }
    } else {
      const response = await this.client.post('/services', serviceData)
      return response.data
    }
  }

  async updateService(id, serviceData) {
    if (isProduction) {
      const docRef = doc(db, 'services', id)
      await updateDoc(docRef, serviceData)
      return { id, ...serviceData }
    } else {
      const response = await this.client.put(`/services/${id}`, serviceData)
      return response.data
    }
  }

  async deleteService(id) {
    if (isProduction) {
      await deleteDoc(doc(db, 'services', id))
    } else {
      await this.client.delete(`/services/${id}`)
    }
  }

  // Volunteers
  async getVolunteersByService(serviceId) {
    if (isProduction) {
      const volunteersCol = collection(db, 'volunteers')
      const q = query(volunteersCol, where('service_id', '==', serviceId))
      const volunteersSnapshot = await getDocs(q)
      return volunteersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } else {
      const response = await this.client.get(`/volunteers/service/${serviceId}`)
      return response.data
    }
  }

  async createVolunteer(volunteerData) {
    if (isProduction) {
      const docRef = await addDoc(collection(db, 'volunteers'), volunteerData)
      return { id: docRef.id, ...volunteerData }
    } else {
      const response = await this.client.post('/volunteers', volunteerData)
      return response.data
    }
  }

  async updateVolunteerStatus(id, status) {
    if (isProduction) {
      const docRef = doc(db, 'volunteers', id)
      await updateDoc(docRef, { status })
    } else {
      await this.client.put(`/volunteers/${id}/status`, { status })
    }
  }

  async deleteVolunteer(id) {
    if (isProduction) {
      await deleteDoc(doc(db, 'volunteers', id))
    } else {
      await this.client.delete(`/volunteers/${id}`)
    }
  }
}

export default new ApiService()
