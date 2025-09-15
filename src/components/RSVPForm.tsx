import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Calendar, Check, X, User } from 'lucide-react'
import { guestApi } from '../lib/api'
import toast from 'react-hot-toast'

interface RSVPFormData {
  name: string
  confirmed: boolean
}

export function RSVPForm() {
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, setValue, watch } = useForm<RSVPFormData>({
    defaultValues: {
      name: '',
      confirmed: false
    }
  })

  const confirmed = watch('confirmed')
  const name = watch('name')
  
  // Validação: nome deve estar preenchido para habilitar botões
  const isNameValid = name && name.trim().length > 0

  const onSubmit = async (data: RSVPFormData) => {
    // Validação básica
    if (!data.name.trim()) {
      toast.error('Por favor, preencha o nome do representante da família')
      return
    }

    setLoading(true)
    try {
      // Criar um novo convidado
      await guestApi.createGuest({
        name: data.name,
        phone: '',
        confirmed: data.confirmed,
        companionsCount: 0,
        companionNames: [],
        dietaryRestrictions: ''
      })

      toast.success(data.confirmed ? 'Presença confirmada!' : 'Resposta salva!')
      
      // Limpar formulário
      setValue('name', '')
      setValue('confirmed', false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar confirmação')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full mb-6"
          >
            <Calendar className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confirmação de Presença
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Por favor, preencha seus dados e confirme sua presença em nosso grande dia.
            Sua resposta é muito importante para nós.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Hidden field for confirmed */}
            <input type="hidden" {...register('confirmed')} />
            
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
            
            {/* Confirmation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Check className="w-5 h-5 mr-2 text-rose-500" />
                Você confirma sua presença?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: isNameValid ? 1.02 : 1 }}
                  whileTap={{ scale: isNameValid ? 0.98 : 1 }}
                  onClick={() => isNameValid && setValue('confirmed', true)}
                  disabled={!isNameValid}
                  className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${
                    !isNameValid 
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : confirmed 
                        ? 'border-green-500 bg-green-50 text-green-700 cursor-pointer hover:border-gray-300' 
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                  }`}
                >
                  <Check className="w-5 h-5 mr-2" />
                  <span className="font-medium">Sim, estarei presente!</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: isNameValid ? 1.02 : 1 }}
                  whileTap={{ scale: isNameValid ? 0.98 : 1 }}
                  onClick={() => isNameValid && setValue('confirmed', false)}
                  disabled={!isNameValid}
                  className={`flex items-center justify-center p-4 border-2 rounded-xl transition-all duration-200 ${
                    !isNameValid 
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : !confirmed 
                        ? 'border-red-500 bg-red-50 text-red-700 cursor-pointer hover:border-gray-300' 
                        : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                  }`}
                >
                  <X className="w-5 h-5 mr-2" />
                  <span className="font-medium">Não poderei comparecer</span>
                </motion.button>
              </div>
            </div>



            {/* Submit button */}
            <motion.button
              whileHover={{ scale: isNameValid && !loading ? 1.02 : 1 }}
              whileTap={{ scale: isNameValid && !loading ? 0.98 : 1 }}
              type="submit"
              disabled={loading || !isNameValid}
              className={`w-full font-medium py-4 px-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center ${
                isNameValid && !loading
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  Salvando...
                </div>
              ) : (
                'Confirmar Resposta'
              )}
            </motion.button>
          </form>
        </div>

      </motion.div>
    </div>
  )
}