import { ref, computed } from 'vue'
import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import apiService from '../services/api.js'

const user = ref(null)
const loading = ref(true)

const isAuthenticated = computed(() => !!user.value)

const signIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  user.value = userCredential.user
  return userCredential
}

export const signUp = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  user.value = userCredential.user
  // Store user in database
  try {
    await apiService.createUser({
      firebase_uid: userCredential.user.uid,
      email: userCredential.user.email,
      role: 'user',
    })
  } catch (error) {
    console.error('Error storing user in database:', error)
    // Don't throw, as Firebase user is created
  }
  return userCredential
}

const signOut = async () => {
  await firebaseSignOut(auth)
  user.value = null
}

// Listen to auth state changes
onAuthStateChanged(auth, (currentUser) => {
  user.value = currentUser
  loading.value = false
})

export function useAuth() {
  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  }
}
