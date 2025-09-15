import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Gift, Check, X, User, ShoppingBag, Heart, AlertCircle } from 'lucide-react'
import { giftApi, Gift as GiftType } from '../lib/api'
import toast from 'react-hot-toast'

interface GiftSelectionFormData {
  name: string
  selectedGifts: string[]
}

export function GiftSelectionForm() {
  const [gifts, setGifts] = useState<GiftType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGifts, setSelectedGifts] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, setValue, watch } = useForm<GiftSelectionFormData>({
    defaultValues: {
      name: '',
      selectedGifts: []
    }
  })

  const name = watch('name')
  
  // Validação: nome deve estar preenchido para habilitar seleção
  const isNameValid = name && name.trim().length > 0

  useEffect(() => {
    loadGifts()
  }, [])

  const loadGifts = async () => {
    try {
      setLoading(true)
      const data = await giftApi.getAll()
      setGifts(data)
    } catch (error) {
      toast.error('Erro ao carregar presentes')
      console.error('Error loading gifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleGiftSelection = (giftId: string) => {
    if (!isNameValid) {
      toast.error('Por favor, preencha o nome do representante da família')
      return
    }

    const gift = gifts.find(g => g.id === giftId)
    if (gift && gift.isReserved) {
      toast.error('Este presente já foi reservado por outra pessoa')
      return
    }

    const isSelected = selectedGifts.includes(giftId)
    
    if (isSelected) {
      // Desmarcar presente
      const newSelection = selectedGifts.filter(id => id !== giftId)
      setSelectedGifts(newSelection)
      setValue('selectedGifts', newSelection)
    } else {
      // Marcar presente
      const newSelection = [...selectedGifts, giftId]
      setSelectedGifts(newSelection)
      setValue('selectedGifts', newSelection)
    }
  }

  const onSubmit = async (data: GiftSelectionFormData) => {
    if (!data.name.trim()) {
      toast.error('Por favor, preencha o nome do representante da família')
      return
    }

    if (selectedGifts.length === 0) {
      toast.error('Por favor, selecione pelo menos um presente')
      return
    }

    setSubmitting(true)
    try {
      // Processar cada presente selecionado
      for (const giftId of selectedGifts) {
        const gift = gifts.find(g => g.id === giftId)
        if (gift && !gift.isReserved) {
          const guestEmail = `${data.name.toLowerCase().replace(/\s+/g, '')}@casamento.com`
          await giftApi.reserve(giftId, guestEmail)
        }
      }

      toast.success('Presentes selecionados com sucesso!')
      
      // Recarregar lista de presentes
      await loadGifts()
      
      // Limpar formulário
      setValue('name', '')
      setValue('selectedGifts', [])
      setSelectedGifts([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao selecionar presentes')
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange.toLowerCase()) {
      case 'até r$ 50':
        return 'bg-green-100 text-green-800'
      case 'r$ 51 - r$ 100':
        return 'bg-blue-100 text-blue-800'
      case 'r$ 101 - r$ 200':
        return 'bg-yellow-100 text-yellow-800'
      case 'r$ 201 - r$ 500':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-purple-100 text-purple-800'
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Carregando presentes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-rose-400 rounded-full mb-6"
          >
            <Gift className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lista de Presentes
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Escolha os presentes que gostaria de nos dar. Sua presença já é o maior presente!
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-rose-500" />
                Seus Dados
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Representante da família *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Nome do representante da família"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  required
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                <div className="text-2xl font-bold text-rose-600 mb-2">{gifts.length}</div>
                <div className="text-gray-600">Total de Presentes</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {gifts.filter(g => g.isReserved).length}
                </div>
                <div className="text-gray-600">Já Reservados</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {gifts.filter(g => !g.isReserved).length}
                </div>
                <div className="text-gray-600">Disponíveis</div>
              </div>
            </div>

            {/* Gift Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-amber-500" />
                Escolha os Presentes
              </h3>
              <p className="text-sm text-gray-600">
                Clique nos presentes que gostaria de nos dar. Você pode selecionar quantos quiser.
              </p>
              
              {gifts.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum presente encontrado
                  </h3>
                  <p className="text-gray-600">
                    A lista de presentes ainda não foi configurada.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gifts.map((gift) => {
                    const isSelected = selectedGifts.includes(gift.id)
                    const isReserved = gift.isReserved
                    const canSelect = isNameValid && !isReserved
                    
                    return (
                      <motion.div
                        key={gift.id}
                        whileHover={{ scale: canSelect ? 1.02 : 1 }}
                        whileTap={{ scale: canSelect ? 0.98 : 1 }}
                        onClick={() => canSelect && toggleGiftSelection(gift.id)}
                        className={`relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-2 overflow-hidden transition-all duration-300 ${
                          isReserved
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            : isSelected
                              ? 'border-rose-500 bg-rose-50 cursor-pointer'
                              : canSelect
                                ? 'border-white/20 hover:border-gray-300 bg-white/80 cursor-pointer hover:shadow-2xl'
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        }`}
                      >
                        {/* Image */}
                        <div className="relative h-48 bg-gradient-to-br from-rose-100 to-amber-100">
                          {gift.imageUrl ? (
                            <img
                              src={gift.imageUrl}
                              alt={gift.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Gift className="w-16 h-16 text-rose-400" />
                            </div>
                          )}
                          
                          {/* Status badges */}
                          <div className="absolute top-4 left-4 flex flex-col space-y-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriceRangeColor(gift.priceRange)}`}>
                              {gift.priceRange}
                            </span>
                            {isReserved && (
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                Reservado
                              </span>
                            )}
                          </div>

                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute top-4 right-4">
                              <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {gift.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {gift.description}
                          </p>
                          
                          <div className="text-xs text-gray-500 mb-4">
                            Categoria: {gift.category}
                          </div>

                          {/* Action indicator */}
                          <div className="flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium">
                            {isReserved ? (
                              <div className="flex items-center text-red-600">
                                <X className="w-4 h-4 mr-2" />
                                Reservado por outro
                              </div>
                            ) : isSelected ? (
                              <div className="flex items-center text-rose-600">
                                <Check className="w-4 h-4 mr-2" />
                                Selecionado
                              </div>
                            ) : canSelect ? (
                              <div className="flex items-center text-gray-600">
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                Clique para selecionar
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-400">
                                <User className="w-4 h-4 mr-2" />
                                Preencha seu nome
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: isNameValid && selectedGifts.length > 0 && !submitting ? 1.02 : 1 }}
              whileTap={{ scale: isNameValid && selectedGifts.length > 0 && !submitting ? 0.98 : 1 }}
              type="submit"
              disabled={submitting || !isNameValid || selectedGifts.length === 0}
              className={`w-full font-medium py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center ${
                isNameValid && selectedGifts.length > 0 && !submitting
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Selecionando...
                </div>
              ) : (
                `Confirmar Seleção (${selectedGifts.length} presente${selectedGifts.length !== 1 ? 's' : ''})`
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8"
        >
          <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl p-8 border border-rose-200">
            <Heart className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Obrigado por fazer parte do nosso dia especial!
            </h3>
            <p className="text-gray-600">
              Sua presença é o maior presente que poderíamos receber. 
              Se escolher um presente da lista, será uma honra recebê-lo.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
