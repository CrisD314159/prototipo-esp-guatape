'use client'

import { Receipt } from '@/lib/Db/db'

interface ReceiptCardProps {
  receipt: Receipt
  paidCard?: boolean
  onPay?: (receipt: Receipt) => void
}

export default function ReceiptCardComponent({ 
  receipt,  
  paidCard = false,
  onPay 
}: ReceiptCardProps) {
  const isOverdue = new Date(receipt.payUntil) < new Date() && !receipt.alreadyPaid
  const isPaid = receipt.alreadyPaid

  return (
    <div className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
      isOverdue ? 'border-red-300 bg-red-50' : 
      isPaid ? 'border-green-300 bg-green-50' : 
      'border-gray-200 bg-white'
    }`}>
      
      {/* Header */}
      <div className={`px-6 py-4 flex justify-between items-center ${
        isOverdue ? 'bg-red-100' : 
        isPaid ? 'bg-green-100' : 
        'bg-blue-50'
      }`}>
        <div>
          <h3 className="font-bold text-lg">Factura #{receipt.id}</h3>
          <p className="text-sm text-gray-600">
            {new Date(receipt.issueDate || receipt.payUntil).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long'
            })}
          </p>
        </div>
        
        <div className="text-right">
          {isPaid ? (
            <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Pagada
            </span>
          ) : isOverdue ? (
            <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Vencida
            </span>
          ) : (
            <span className="inline-block bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Pendiente
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        
        {/* Consumo de agua */}
        {receipt.waterUsage && (
          <div className="flex items-center gap-3 mb-4 bg-blue-50 rounded-lg p-4">
            <span className="text-4xl">💧</span>
            <div>
              <p className="text-sm text-gray-600">Consumo del período</p>
              <p className="text-2xl font-bold text-blue-700">{receipt.waterUsage} m³</p>
            </div>
          </div>
        )}

        {/* Desglose de costos */}
        <div className="space-y-2 mb-4">
          {receipt.total && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cargo base</span>
              <span className="font-medium">${receipt.total.toLocaleString('es-CO')}</span>
            </div>
          )}
          <div className="border-t-2 pt-3 flex justify-between items-center">
            <span className="font-bold text-lg">Total a pagar</span>
            <span className="text-2xl font-bold text-blue-600">
              ${receipt.total.toLocaleString('es-CO')}
            </span>
          </div>
        </div>

        {/* Info de fecha de vencimiento o pago */}
        {isPaid ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded">
            <p className="text-sm font-semibold text-green-900 mb-1">Pagada el:</p>
            <p className="text-sm text-green-700 mb-3">
              {new Date(receipt.paymentDate).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>

            {/* Detalles de transacción */}
            {receipt.paymentId && (
              <div className="space-y-1 pt-3 border-t border-green-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-green-700 font-medium">Transacción:</span>
                  <span className="font-mono text-green-800">{receipt.paymentId}</span>
                </div>
                {receipt.paymentMethod && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-green-700 font-medium">Método:</span>
                    <span className="text-green-800 capitalize">
                      {receipt.paymentMethod.replace('_', ' ')}
                      {receipt.cardLastFour && ` •••• ${receipt.cardLastFour}`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className={`border-l-4 p-4 mb-4 rounded ${
            isOverdue ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'
          }`}>
            <p className="text-sm font-semibold mb-1">
              {isOverdue ? '⚠️ Venció el:' : '📅 Vence el:'}
            </p>
            <p className={`text-sm font-medium ${isOverdue ? 'text-red-700' : 'text-blue-700'}`}>
              {new Date(receipt.payUntil).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            {isOverdue && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                Esta factura está vencida. Realiza el pago lo antes posible para evitar suspensión del servicio.
              </p>
            )}
          </div>
        )}

        {/* Botones de acción */}
        {!isPaid && onPay && (
          <button
            onClick={() => onPay(receipt)}
            className={`w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
              isOverdue 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
            }`}
          >
            {isOverdue ? 'Pagar ahora (Vencida)' : 'Pagar factura'}
          </button>
        )}

        {isPaid && paidCard && (
          <button
            onClick={() => {
              // Simular descarga de comprobante
              const receiptData = `
COMPROBANTE DE PAGO
==================
Factura: #${receipt.id}
Fecha de pago: ${new Date(receipt.paymentDate).toLocaleDateString('es-CO')}
Monto: $${receipt.total.toLocaleString('es-CO')}
Transacción: ${receipt.paymentId}
              `.trim()
              
              const blob = new Blob([receiptData], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `comprobante-${receipt.id}.txt`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="w-full py-3 rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 transition-colors"
          >
            📄 Descargar comprobante
          </button>
        )}
      </div>
    </div>
  )
}