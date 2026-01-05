import axios from 'axios'
import { db } from '../firebase.js'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  getCountFromServer,
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
      const q = query(servicesCol, orderBy('service_date', 'desc'), orderBy('service_time', 'desc'))
      const servicesSnapshot = await getDocs(q)
      const services = servicesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      // Add volunteer_count for each service
      const servicesWithCount = await Promise.all(
        services.map(async (service) => {
          const count = await this.getVolunteerCount(service.id)
          return { ...service, volunteer_count: count }
        }),
      )
      return servicesWithCount
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
      const volunteers = volunteersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      // Fetch volunteer details from volunteer_list
      const volunteerListCol = collection(db, 'volunteer_list')
      const volunteerIds = [...new Set(volunteers.map((v) => v.volunteer_id))]
      const volunteerDetailsPromises = volunteerIds.map((id) => getDoc(doc(volunteerListCol, id)))
      const volunteerDetailsSnapshots = await Promise.all(volunteerDetailsPromises)
      const volunteerDetailsMap = {}
      volunteerDetailsSnapshots.forEach((snapshot) => {
        if (snapshot.exists()) {
          volunteerDetailsMap[snapshot.id] = snapshot.data()
        }
      })

      // Merge data
      return volunteers.map((volunteer) => ({
        ...volunteer,
        full_name: volunteerDetailsMap[volunteer.volunteer_id]?.full_name || '',
        phone: volunteerDetailsMap[volunteer.volunteer_id]?.phone || '',
        email: volunteerDetailsMap[volunteer.volunteer_id]?.email || '',
      }))
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

  async getVolunteerCount(serviceId) {
    if (isProduction) {
      const volunteersCol = collection(db, 'volunteers')
      const q = query(volunteersCol, where('service_id', '==', serviceId))
      const snapshot = await getCountFromServer(q)
      return snapshot.data().count
    } else {
      const response = await this.client.get(`/volunteers/service/${serviceId}/count`)
      return response.data.count
    }
  }

  // Volunteer List
  async getVolunteerList() {
    if (isProduction) {
      const volunteerListCol = collection(db, 'volunteer_list')
      const q = query(volunteerListCol, orderBy('full_name'))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    } else {
      const response = await this.client.get('/volunteer-list')
      return response.data
    }
  }

  async createVolunteerList(volunteerData) {
    if (isProduction) {
      const docRef = await addDoc(collection(db, 'volunteer_list'), volunteerData)
      return { id: docRef.id, ...volunteerData }
    } else {
      const response = await this.client.post('/volunteer-list', volunteerData)
      return response.data
    }
  }
}

export default new ApiService()
