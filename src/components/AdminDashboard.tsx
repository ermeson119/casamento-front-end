import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Gift, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Calendar,
  LogOut,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalGuests: number
  confirmedGuests: number
  confirmationRate: number
  totalGifts: number
  reservedGifts: number
  reservationRate: number
}

interface Guest {
  id: string
  name: string
  email: string
  confirmed: boolean
  createdAt: string
  reservedGifts: Array<{ id: string; name: string }>
}

interface Gift {
  id: string
  name: string
  description: string
  category: string
  priceRange: string
  imageUrl: string | null
  isReserved: boolean
  reservedBy: string | null
  reservedAt: string | null
  createdAt: string
  reservedByGuest?: {
    id: string
    name: string
    email: string
  }
}

export function AdminDashboard() {
  const { user, logout, token } = useAdminAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'guests' | 'gifts' | 'selected-gifts'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterConfirmed, setFilterConfirmed] = useState<string>('all')
  const [guestsCurrentPage, setGuestsCurrentPage] = useState(1)
  const guestsPerPage = 6
  const [giftsCurrentPage, setGiftsCurrentPage] = useState(1)
  const giftsPerPage = 6
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)
  const [giftForm, setGiftForm] = useState({
    name: '',
    description: '',
    category: '',
    imageUrl: ''
  })
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteItem, setDeleteItem] = useState<{ type: 'guest' | 'gift', id: string, name: string } | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setGuestsCurrentPage(1)
  }, [searchTerm, filterConfirmed])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardRes, guestsRes, giftsRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/admin/guests', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/admin/gifts', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json()
        setStats(dashboardData.stats)
      }

      if (guestsRes.ok) {
        const guestsData = await guestsRes.json()
        setGuests(guestsData.guests)
      }

      if (giftsRes.ok) {
        const giftsData = await giftsRes.json()
        setGifts(giftsData.gifts)
      }
    } catch (error) {
      toast.error('Erro ao carregar dados')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGuest = (guestId: string) => {
    const guest = guests.find(g => g.id === guestId)
    if (guest) {
      setDeleteItem({ type: 'guest', id: guestId, name: guest.name })
      setShowDeleteModal(true)
    }
  }

  const handleDeleteGift = (giftId: string) => {
    const gift = gifts.find(g => g.id === giftId)
    if (gift) {
      setDeleteItem({ type: 'gift', id: giftId, name: gift.name })
      setShowDeleteModal(true)
    }
  }

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterConfirmed === 'all' ||
                         (filterConfirmed === 'confirmed' && guest.confirmed) ||
                         (filterConfirmed === 'not-confirmed' && !guest.confirmed)
    return matchesSearch && matchesFilter
  })

  // Paginação para convidados
  const guestsTotalPages = Math.ceil(filteredGuests.length / guestsPerPage)
  const guestsStartIndex = (guestsCurrentPage - 1) * guestsPerPage
  const guestsEndIndex = guestsStartIndex + guestsPerPage
  const currentGuests = filteredGuests.slice(guestsStartIndex, guestsEndIndex)

  const goToGuestsPage = (page: number) => {
    setGuestsCurrentPage(page)
  }

  const goToPreviousGuestsPage = () => {
    if (guestsCurrentPage > 1) {
      setGuestsCurrentPage(guestsCurrentPage - 1)
    }
  }

  const goToNextGuestsPage = () => {
    if (guestsCurrentPage < guestsTotalPages) {
      setGuestsCurrentPage(guestsCurrentPage + 1)
    }
  }

  // Paginação para presentes
  const giftsTotalPages = Math.ceil(gifts.length / giftsPerPage)
  const giftsStartIndex = (giftsCurrentPage - 1) * giftsPerPage
  const giftsEndIndex = giftsStartIndex + giftsPerPage
  const currentGifts = gifts.slice(giftsStartIndex, giftsEndIndex)

  const goToGiftsPage = (page: number) => {
    setGiftsCurrentPage(page)
  }

  const goToNextGiftsPage = () => {
    if (giftsCurrentPage < giftsTotalPages) {
      setGiftsCurrentPage(giftsCurrentPage + 1)
    }
  }

  const goToPreviousGiftsPage = () => {
    if (giftsCurrentPage > 1) {
      setGiftsCurrentPage(giftsCurrentPage - 1)
    }
  }

  const openGiftModal = (gift?: Gift) => {
    if (gift) {
      setEditingGift(gift)
      setGiftForm({
        name: gift.name,
        description: gift.description,
        category: gift.category,
        imageUrl: gift.imageUrl || ''
      })
    } else {
      setEditingGift(null)
      setGiftForm({
        name: '',
        description: '',
        category: '',
        imageUrl: ''
      })
    }
    setShowGiftModal(true)
  }

  const closeGiftModal = () => {
    setShowGiftModal(false)
    setEditingGift(null)
    setGiftForm({
      name: '',
      description: '',
      category: '',
      imageUrl: ''
    })
  }

  const openGuestModal = (guest: Guest) => {
    setSelectedGuest(guest)
    setShowGuestModal(true)
  }

  const closeGuestModal = () => {
    setShowGuestModal(false)
    setSelectedGuest(null)
  }

  const confirmDelete = async () => {
    if (!deleteItem) return

    try {
      const endpoint = deleteItem.type === 'guest' 
        ? `http://localhost:3001/api/admin/guests/${deleteItem.id}`
        : `http://localhost:3001/api/admin/gifts/${deleteItem.id}`

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const itemType = deleteItem.type === 'guest' ? 'convidado' : 'presente'
        toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} removido com sucesso`)
        loadDashboardData()
        setShowDeleteModal(false)
        setDeleteItem(null)
      } else {
        const itemType = deleteItem.type === 'guest' ? 'convidado' : 'presente'
        toast.error(`Erro ao remover ${itemType}`)
      }
    } catch (error) {
      const itemType = deleteItem.type === 'guest' ? 'convidado' : 'presente'
      toast.error(`Erro ao remover ${itemType}`)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setDeleteItem(null)
  }

  const handleRemoveGiftReservation = async (giftId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/gifts/${giftId}/unreserve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('Reserva do presente removida com sucesso')
        loadDashboardData()
      } else {
        toast.error('Erro ao remover reserva do presente')
      }
    } catch (error) {
      toast.error('Erro ao remover reserva do presente')
    }
  }

  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!giftForm.name.trim() || !giftForm.description.trim() || !giftForm.category.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios')
      return
    }

    try {
      const giftData = {
        name: giftForm.name.trim(),
        description: giftForm.description.trim(),
        category: giftForm.category.trim(),
        imageUrl: giftForm.imageUrl.trim() || null
      }

      if (editingGift) {
        // Editar presente existente
        const response = await fetch(`http://localhost:3001/api/admin/gifts/${editingGift.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(giftData)
        })

        if (!response.ok) {
          throw new Error('Erro ao editar presente')
        }

        toast.success('Presente editado com sucesso!')
      } else {
        // Criar novo presente
        const response = await fetch('http://localhost:3001/api/admin/gifts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(giftData)
        })

        if (!response.ok) {
          throw new Error('Erro ao criar presente')
        }

        toast.success('Presente criado com sucesso!')
      }

      // Recarregar dados
      await loadDashboardData()
      closeGiftModal()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar presente')
      console.error('Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-300 mx-auto"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Carregando Dashboard</h3>
          <p className="text-gray-600">Preparando suas informações...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-blue-500 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Painel Administrativo
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Gerenciamento do casamento</p>
              </div>
              <div className="block sm:hidden">
                <h1 className="text-lg font-bold text-gray-900">Admin</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden lg:flex items-center space-x-3 bg-gray-100 rounded-xl px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-2.5 text-gray-700 hover:text-white bg-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-lg sm:rounded-xl border border-gray-200 hover:border-red-500 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-semibold text-xs sm:text-sm hidden sm:inline">Sair</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Navigation */}
        <nav className="mb-4 sm:mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-1 sm:p-2">
            <div className="grid grid-cols-2 sm:flex sm:space-x-2 gap-1 sm:gap-0">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, shortLabel: 'Dashboard' },
                { id: 'guests', label: 'Convidados', icon: Users, shortLabel: 'Convidados' },
                { id: 'gifts', label: 'Presentes', icon: Gift, shortLabel: 'Presentes' },
                { id: 'selected-gifts', label: 'Presentes Escolhidos', icon: CheckCircle, shortLabel: 'Escolhidos' }
              ].map(({ id, label, icon: Icon, shortLabel }) => {
                const getActiveStyles = () => {
                  switch (id) {
                    case 'dashboard':
                      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200'
                    case 'guests':
                      return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200'
                    case 'gifts':
                      return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200'
                    case 'selected-gifts':
                      return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                    default:
                      return 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md'
                  }
                }

                return (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(id as any)}
                    className={`relative flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 px-3 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold text-xs sm:text-sm ${
                      activeTab === id
                        ? getActiveStyles()
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-1 sm:p-1.5 rounded-md sm:rounded-lg ${
                      activeTab === id 
                        ? 'bg-white/20' 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        activeTab === id ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{shortLabel}</span>
                    {activeTab === id && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full shadow-sm"></div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </nav>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
        {activeTab === 'dashboard' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-blue-700 mb-1">Total Convidados</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900">{stats.totalGuests}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 h-1 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-full"></div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-green-700 mb-1">Confirmados</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900">{stats.confirmedGuests}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 h-1 bg-green-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.confirmationRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-green-600 font-medium mt-2">
                  {stats.confirmationRate}% de confirmação
                </p>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-purple-700 mb-1">Total Presentes</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-900">{stats.totalGifts}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                    <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 h-1 bg-purple-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full w-full"></div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-orange-700 mb-1">Reservados</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-900">{stats.reservedGifts}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 h-1 bg-orange-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-1000"
                    style={{ width: `${stats.reservationRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-orange-600 font-medium mt-2">
                  {stats.reservationRate}% de reserva
                </p>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg"
              >
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Convidados Recentes</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {guests.slice(0, 5).map((guest, index) => (
                    <motion.div 
                      key={guest.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <span className="text-xs sm:text-sm font-semibold text-gray-600">
                            {guest.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{guest.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(guest.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center flex-shrink-0 ml-2">
                        {guest.confirmed ? (
                          <div className="flex items-center bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="text-xs font-medium hidden sm:inline">Confirmado</span>
                            <span className="text-xs font-medium sm:hidden">✓</span>
                          </div>
                        ) : (
                          <div className="flex items-center bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full">
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="text-xs font-medium hidden sm:inline">Pendente</span>
                            <span className="text-xs font-medium sm:hidden">⏳</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-white to-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200 shadow-lg"
              >
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-2 sm:mr-3">
                    <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Presentes Escolhidos</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {gifts.filter(gift => gift.isReserved).slice(0, 5).map((gift, index) => (
                    <motion.div 
                      key={gift.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-green-100 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">{gift.name}</p>
                          {gift.reservedByGuest && (
                            <p className="text-xs sm:text-sm text-green-700 font-medium mb-1 truncate">
                              Por: {gift.reservedByGuest.name}
                            </p>
                          )}
                          {gift.reservedAt && (
                            <p className="text-xs text-gray-500">
                              Escolhido em: {new Date(gift.reservedAt).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="text-xs font-medium hidden sm:inline">Escolhido</span>
                          <span className="text-xs font-medium sm:hidden">✓</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {gifts.filter(gift => gift.isReserved).length === 0 && (
                    <div className="text-center py-6 sm:py-8">
                      <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium text-sm sm:text-base">Nenhum presente escolhido ainda</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'guests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Filters */}
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar convidados..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <select
                    value={filterConfirmed}
                    onChange={(e) => setFilterConfirmed(e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm sm:text-base"
                  >
                    <option value="all">Todos</option>
                    <option value="confirmed">Confirmados</option>
                    <option value="not-confirmed">Não confirmados</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Guests Table */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Convidado
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                        Presentes
                      </th>
                      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentGuests.map((guest, index) => (
                      <motion.tr 
                        key={guest.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                              <span className="text-xs sm:text-sm font-semibold text-blue-700">
                                {guest.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 truncate">{guest.name}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(guest.createdAt).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="sm:hidden mt-1">
                                {guest.confirmed ? (
                                  <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full w-fit">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    <span className="text-xs font-medium">Confirmado</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full w-fit">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    <span className="text-xs font-medium">Pendente</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="flex items-center">
                            {guest.confirmed ? (
                              <div className="flex items-center bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm font-medium">Confirmado</span>
                              </div>
                            ) : (
                              <div className="flex items-center bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full">
                                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="text-xs sm:text-sm font-medium">Pendente</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="flex items-center">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-2">
                              <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {guest.reservedGifts.length}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-1 sm:space-x-2">
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              onClick={() => openGuestModal(guest)}
                              title="Visualizar detalhes"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                              onClick={() => handleDeleteGuest(guest.id)}
                              title="Excluir convidado"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginação para Convidados */}
            {guestsTotalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToPreviousGuestsPage}
                  disabled={guestsCurrentPage === 1}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </motion.button>

                <div className="flex space-x-1 sm:space-x-2">
                  {Array.from({ length: guestsTotalPages }, (_, i) => i + 1).map((page) => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToGuestsPage(page)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-colors text-sm ${
                        guestsCurrentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToNextGuestsPage}
                  disabled={guestsCurrentPage === guestsTotalPages}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <span>Próximo</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* Informações da paginação */}
            <div className="text-center text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
              Mostrando {guestsStartIndex + 1} a {Math.min(guestsEndIndex, filteredGuests.length)} de {filteredGuests.length} convidados
            </div>
          </motion.div>
        )}

        {activeTab === 'gifts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gerenciar Presentes</h2>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openGiftModal()}
                className="flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg font-medium text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Adicionar Presente</span>
              </motion.button>
            </div>

            {/* Gifts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {currentGifts.map((gift, index) => (
                <motion.div 
                  key={gift.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border shadow-lg transition-all duration-300 ${
                    gift.isReserved 
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 flex-1 mr-2 sm:mr-3 line-clamp-2">{gift.name}</h3>
                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openGiftModal(gift)}
                        className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Editar presente"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                        onClick={() => handleDeleteGift(gift.id)}
                        title="Excluir presente"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{gift.description}</p>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-500 font-medium">Categoria:</span>
                      <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                        {gift.category}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-gray-500 font-medium">Status:</span>
                      <div className="flex items-center">
                        {gift.isReserved ? (
                          <div className="flex items-center bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="text-xs font-semibold">Reservado</span>
                          </div>
                        ) : (
                          <div className="flex items-center bg-gray-100 text-gray-600 px-2 sm:px-3 py-1 rounded-full">
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="text-xs font-semibold">Disponível</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {gift.isReserved && gift.reservedByGuest && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                        <div className="flex justify-between items-center text-xs sm:text-sm">
                          <span className="text-green-700 font-medium">Escolhido por:</span>
                          <span className="font-semibold text-green-800 truncate ml-2">{gift.reservedByGuest.name}</span>
                        </div>
                        {gift.reservedAt && (
                          <div className="text-xs text-green-600 mt-1">
                            {new Date(gift.reservedAt).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Paginação para Presentes */}
            {giftsTotalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToPreviousGiftsPage}
                  disabled={giftsCurrentPage === 1}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </motion.button>

                <div className="flex space-x-1 sm:space-x-2">
                  {Array.from({ length: giftsTotalPages }, (_, i) => i + 1).map((page) => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToGiftsPage(page)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-colors text-sm ${
                        giftsCurrentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToNextGiftsPage}
                  disabled={giftsCurrentPage === giftsTotalPages}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <span>Próximo</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}

            {/* Informações da paginação */}
            <div className="text-center text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
              Mostrando {giftsStartIndex + 1} a {Math.min(giftsEndIndex, gifts.length)} de {gifts.length} presentes
            </div>
          </motion.div>
        )}

        {activeTab === 'selected-gifts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Presentes Escolhidos</h2>
              </div>
              <div className="bg-green-100 text-green-700 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base">
                Total: {gifts.filter(gift => gift.isReserved).length} presente{gifts.filter(gift => gift.isReserved).length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Selected Gifts List */}
            {gifts.filter(gift => gift.isReserved).length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Gift className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Nenhum presente escolhido ainda
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Os presentes escolhidos aparecerão aqui quando os convidados fizerem suas seleções.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {gifts.filter(gift => gift.isReserved).map((gift) => (
                  <div key={gift.id} className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2">{gift.name}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{gift.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          <span className="text-xs text-green-600 font-medium">Escolhido</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemoveGiftReservation(gift.id)}
                          className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Remover reserva"
                        >
                          <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-500">Categoria:</span>
                        <span className="font-medium text-gray-900 truncate ml-2">{gift.category}</span>
                      </div>
                      <div className="border-t border-green-200 pt-2 sm:pt-3">
                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                          <span className="text-gray-500">Escolhido por:</span>
                          <span className="font-semibold text-green-700 truncate ml-2">
                            {gift.reservedByGuest?.name || 'Convidado'}
                          </span>
                        </div>
                        {gift.reservedAt && (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Data:</span>
                            <span className="text-gray-600">
                              {new Date(gift.reservedAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        </div>
      </main>

      {/* Modal para Criar/Editar Presente */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-100"
          >
            <div className="p-4 sm:p-8">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                    <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                    {editingGift ? 'Editar Presente' : 'Adicionar Presente'}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeGiftModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              </div>

              <form onSubmit={handleGiftSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    Nome do Presente *
                  </label>
                  <input
                    type="text"
                    value={giftForm.name}
                    onChange={(e) => setGiftForm({ ...giftForm, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                    placeholder="Ex: Jogo de Panelas Antiaderente"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    Descrição *
                  </label>
                  <textarea
                    value={giftForm.description}
                    onChange={(e) => setGiftForm({ ...giftForm, description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none text-sm sm:text-base"
                    placeholder="Descreva o presente..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    Categoria *
                  </label>
                  <select
                    value={giftForm.category}
                    onChange={(e) => setGiftForm({ ...giftForm, category: e.target.value })}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="cozinha">Cozinha</option>
                    <option value="casa">Casa</option>
                    <option value="eletrônicos">Eletrônicos</option>
                    <option value="decoração">Decoração</option>
                    <option value="roupas">Roupas</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    URL da Imagem (opcional)
                  </label>
                  <input
                    type="url"
                    value={giftForm.imageUrl}
                    onChange={(e) => setGiftForm({ ...giftForm, imageUrl: e.target.value })}
                    className="w-full px-3 sm:px-4 py-3 sm:py-4 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={closeGiftModal}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg text-sm sm:text-base"
                  >
                    {editingGift ? 'Salvar Alterações' : 'Criar Presente'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Visualização do Convidado */}
      {showGuestModal && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-100"
          >
            <div className="p-4 sm:p-8">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Detalhes do Convidado</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeGuestModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Informações Básicas */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md sm:rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Informações Básicas</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">
                        Nome
                      </label>
                      <p className="text-gray-900 font-bold text-base sm:text-lg">{selectedGuest.name}</p>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">
                        Status
                      </label>
                      <div className="flex items-center">
                        {selectedGuest.confirmed ? (
                          <div className="flex items-center bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="font-semibold text-xs sm:text-sm">Confirmado</span>
                          </div>
                        ) : (
                          <div className="flex items-center bg-red-100 text-red-700 px-2 sm:px-3 py-1 rounded-full">
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="font-semibold text-xs sm:text-sm">Pendente</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">
                        Data de Cadastro
                      </label>
                      <p className="text-gray-900 font-medium text-sm sm:text-base">
                        {new Date(selectedGuest.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Presentes Reservados */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-md sm:rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                      <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      Presentes Reservados ({selectedGuest.reservedGifts.length})
                    </h3>
                  </div>
                  {selectedGuest.reservedGifts.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {selectedGuest.reservedGifts.map((gift, index) => (
                        <motion.div 
                          key={gift.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-200 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                            <span className="text-gray-900 font-semibold text-sm sm:text-base truncate">{gift.name}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium text-base sm:text-lg">Nenhum presente reservado ainda</p>
                      <p className="text-gray-400 text-sm mt-2">Os presentes escolhidos aparecerão aqui</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 sm:pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeGuestModal}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg text-sm sm:text-base"
                >
                  Fechar
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && deleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full border border-gray-100"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center mr-4">
                  <Trash2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Confirmar Exclusão
                  </h2>
                  <p className="text-sm text-gray-600">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 text-sm sm:text-base">
                  Tem certeza que deseja excluir{' '}
                  <span className="font-semibold text-gray-900">
                    {deleteItem.name}
                  </span>
                  ?
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  {deleteItem.type === 'guest' 
                    ? 'Todos os dados do convidado serão removidos permanentemente.'
                    : 'Este presente será removido da lista e não poderá ser recuperado.'
                  }
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={cancelDelete}
                  className="flex-1 px-4 sm:px-6 py-3 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDelete}
                  className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg text-sm sm:text-base"
                >
                  Excluir
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

