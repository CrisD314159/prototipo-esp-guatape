// components/PaymentModal.tsx
'use client'

import { useState } from 'react'
import { Receipt } from '@/lib/Db/db'
import { PaymentMethod, PayReceipt, validateCard } from '@/lib/serverActions/ReceiptsActions/ReceiptAndPaymentActions'

interface PaymentModalProps {
  receipt: Receipt
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentModal({ receipt, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'method' | 'card' | 'processing' | 'success' | 'error'>('method')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [error, setError] = useState('')
  const [transactionInfo, setTransactionInfo] = useState<{    success: boolean,
    message: string,
    transactionId: string | undefined,
    authorizationCode: string | undefined} | null | undefined>(null)

  const paymentMethodsInfo = {
    credit_card: { name: 'Tarjeta de Crédito', icon: '💳', color: 'blue' },
    debit_card: { name: 'Tarjeta Débito', icon: '💳', color: 'green' },
    pse: { name: 'PSE', icon: '🏦', color: 'orange' },
    nequi: { name: 'Nequi', icon: '📱', color: 'purple' },
    daviplata: { name: 'DaviPlata', icon: '📱', color: 'red' },
    cash: { name: 'Efectivo', icon: '💵', color: 'gray' }
  }

  function formatCardNumber(value: string) {
    const cleaned = value.replace(/\s/g, '')
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(' ').substring(0, 19)
  }

  function formatExpiry(value: string) {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4)
    }
    return cleaned
  }

  async function handlePayment() {
    setError('')

    // Validar campos según método
    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
        setError('Por favor completa todos los campos')
        return
      }

      const validation = validateCard(cardNumber.replace(/\s/g, ''))
      if (!validation.valid) {
        setError(validation.message || 'Tarjeta inválida')
        return
      }
    }

    setStep('processing')

    try {
      const result = await PayReceipt(
        receipt.id!,
        paymentMethod,
        cardNumber.replace(/\s/g, '')
      )

      setTransactionInfo(result)
      setStep('success')
      
      // Cerrar automáticamente después de 3 segundos
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pago')
      setStep('error')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-indigo-900 text-white rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Realizar Pago</h2>
              <p className="text-blue-100 text-sm mt-1">
                Factura #{receipt.id}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Resumen de factura */}
          <div className="from-blue-50 to-blue-100 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-700">Consumo</span>
              <span className="font-semibold">{receipt.waterUsage} m³</span>
            </div>
            {receipt.total && (
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold">${receipt.total.toLocaleString('es-CO')}</span>
              </div>
            )}

            <div className="border-t border-blue-300 pt-3 mt-3 flex justify-between items-center">
              <span className="font-bold text-lg">Total a pagar</span>
              <span className="text-2xl font-bold text-blue-700">
                ${receipt.total.toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* Step: Seleccionar método */}
          {step === 'method' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Selecciona método de pago</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(paymentMethodsInfo).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setPaymentMethod(key as PaymentMethod)
                      if (key === 'credit_card' || key === 'debit_card') {
                        setStep('card')
                      } else {
                        setStep('processing')
                        handlePayment()
                      }
                    }}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{info.icon}</div>
                    <div className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">{info.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Datos de tarjeta */}
          {step === 'card' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => setStep('method')}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline mb-4 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Cambiar método
              </button>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Nombre en la tarjeta
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="JUAN PEREZ"
                  className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 outline-none transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50  text-red-700 p-4 rounded animate-in fade-in">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                className="w-full bg-indigo-800 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                 Pagar ${receipt.total.toLocaleString('es-CO')}
              </button>
            </div>
          )}

          {/* Step: Procesando */}
          {step === 'processing' && (
            <div className="text-center py-12 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
                <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Procesando tu pago...</h3>
              <div className="mt-6 flex justify-center gap-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {/* Step: Éxito */}
          {step === 'success' && transactionInfo && (
            <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-3">¡Pago exitoso!</h3>
              <p className="text-gray-600 mb-6">Tu pago ha sido procesado correctamente</p>
              
              <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-gray-600">Transacción</span>
                  <span className="font-mono font-bold text-sm">{transactionInfo.transactionId}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-gray-600">Autorización</span>
                  <span className="font-mono font-bold text-sm">{transactionInfo.authorizationCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monto</span>
                  <span className="font-bold text-lg text-green-600">${receipt.total.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-3">Pago rechazado</h3>
              <p className="text-gray-700 mb-6 bg-red-50 p-4 rounded-lg border border-red-200">{error}</p>
              
              <button
                onClick={() => {
                  setError('')
                  setStep('method')
                  setCardNumber('')
                  setCardHolder('')
                  setExpiryDate('')
                  setCvv('')
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors transform hover:scale-105 active:scale-95"
              >
                🔄 Intentar de nuevo
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}