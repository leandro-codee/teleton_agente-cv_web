import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { api } from '@/lib/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name: string, company_name: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  clearError: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        console.log('useAuth: Iniciando login...')
        set({ isLoading: true, error: null })
        try {
          console.log('useAuth: Llamando API...')
          const response = await api.login(email, password)
          localStorage.setItem('auth_token', response.access_token)
          console.log('useAuth: Respuesta API:', response)
          
          set({ 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          })
          console.log('useAuth: Estado actualizado, isAuthenticated = true')
          
          // Esperar un poco para asegurar que el estado se propague
          await new Promise(resolve => setTimeout(resolve, 500))
          console.log('useAuth: Login completado')
        } catch (error) {
          console.error('useAuth: Error en login:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Error de login',
            isLoading: false 
          })
          throw error
        }
      },
      
      register: async (email: string, password: string, full_name: string, company_name: string) => {
        set({ isLoading: true, error: null })
        try {
          await api.register(email, password, full_name, company_name)
          set({ isLoading: false, error: null })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error de registro',
            isLoading: false 
          })
          throw error
        }
      },
      
      logout: () => {
        api.logout()
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null,
          isLoading: false 
        })
      },
      
      setUser: (user: User) => {
        set({ user, isAuthenticated: true, error: null })
      },
      
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)