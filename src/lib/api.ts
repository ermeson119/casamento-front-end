const API_BASE_URL = 'http://localhost:3001/api'

export interface Guest {
  id: string
  name: string
  email: string
  phone?: string
  maxCompanions: number
  confirmed: boolean
  companionsCount: number
  companionNames: string[]
  dietaryRestrictions?: string
  createdAt: string
  updatedAt: string
}

export interface Gift {
  id: string
  name: string
  description: string
  category: string
  priceRange: string
  imageUrl: string | null
  isReserved: boolean
  reservedBy: string | null
  reservedAt: string | null
  tempReservedBy: string | null
  tempReservedAt: string | null
  createdAt: string
  updatedAt: string
}

// Helper function to get auth headers
const getAuthHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
})

// Guest API
export const guestApi = {
  createGuest: async (data: {
    name: string
    email?: string
    phone?: string
    confirmed: boolean
    companionsCount: number
    companionNames: string[]
    dietaryRestrictions: string
  }): Promise<Guest> => {
    const response = await fetch(`${API_BASE_URL}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar convidado')
    }

    return response.json()
  },

  updateRSVP: async (token: string, data: {
    confirmed: boolean
    companionsCount: number
    companionNames: string[]
    dietaryRestrictions: string
  }): Promise<Guest> => {
    const response = await fetch(`${API_BASE_URL}/guests/rsvp`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao atualizar confirmação')
    }

    return response.json()
  },

  updateProfile: async (token: string, data: {
    name: string
    phone?: string
    maxCompanions: number
  }): Promise<Guest> => {
    const response = await fetch(`${API_BASE_URL}/guests/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao atualizar perfil')
    }

    return response.json()
  }
}

// Gift API
export const giftApi = {
  getAll: async (): Promise<Gift[]> => {
    const response = await fetch(`${API_BASE_URL}/gifts`)

    if (!response.ok) {
      throw new Error('Erro ao carregar presentes')
    }

    return response.json()
  },

  reserve: async (giftId: string, guestEmail: string): Promise<Gift & { action: 'reserved' | 'cancelled' }> => {
    const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/reserve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guestEmail }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao reservar presente')
    }

    return response.json()
  },

  tempReserve: async (giftId: string, guestEmail: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/temp-reserve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guestEmail }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao marcar visualização')
    }
  },

  clearTempReserve: async (giftId: string, guestEmail: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/gifts/${giftId}/temp-reserve`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guestEmail }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao limpar visualização')
    }
  }
}