import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Gift, Check, X, User, ShoppingBag, Heart, AlertCircle, ChevronLeft, ChevronRight, Copy } from 'lucide-react'
import { giftApi, Gift as GiftType } from '../lib/api'
import toast from 'react-hot-toast'

interface GiftSelectionFormData {
  name: string
  selectedGifts: string[]
}

export function GiftList() {
  const [gifts, setGifts] = useState<GiftType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGifts, setSelectedGifts] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const { register, handleSubmit, setValue, watch } = useForm<GiftSelectionFormData>({
    defaultValues: {
      name: '',
      selectedGifts: []
    }
  })

  const name = watch('name')
  
  // Validação: nome deve estar preenchido para habilitar seleção
  const isNameValid = name && name.trim().length > 0

  // Paginação
  const totalPages = Math.ceil(gifts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentGifts = gifts.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const copyPixKey = async () => {
    try {
      await navigator.clipboard.writeText('63981201914')
      toast.success('Chave PIX copiada para a área de transferência!')
    } catch (error) {
      toast.error('Erro ao copiar chave PIX')
    }
  }

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

              {/* PIX Option */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      💳 Prefere fazer um PIX?
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Se preferir contribuir com um valor em dinheiro, você pode fazer um PIX para nos ajudar com os preparativos do casamento.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Chave PIX:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-medium text-gray-900">63981201914</span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={copyPixKey}
                              className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                              title="Copiar chave PIX"
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Nome:</span>
                          <span className="font-medium text-gray-900">Ermeson Balbinot Andrade</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Banco:</span>
                          <span className="font-medium text-gray-900">Nubank</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💳</span>
                    </div>
                  </div>
                </div>
              </div>
              
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
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentGifts.map((gift) => {
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

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-4 mt-8">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </motion.button>

                      <div className="flex space-x-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <motion.button
                            key={page}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => goToPage(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-rose-500 text-white'
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
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <span>Próximo</span>
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}

                  {/* Informações da paginação */}
                  <div className="text-center text-sm text-gray-600 mt-4">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, gifts.length)} de {gifts.length} presentes
                  </div>
                </>
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
              Se escolher um presente da lista ou contribuir com um PIX, será uma honra recebê-lo.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
