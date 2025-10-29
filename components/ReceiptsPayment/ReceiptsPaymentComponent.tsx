'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Receipt } from '@/lib/Db/db'
import ReceiptCardComponent from './ReceiptCardComponent'
import PaymentModal from './PaymentModal'
import { GetPendingReceipts } from '@/lib/serverActions/ReceiptsActions/ReceiptAndPaymentActions'


export default function ReceiptsPaymentComponent() {
  const { data, error, isLoading, mutate } = useSWR<Receipt[]>('receipts', GetPendingReceipts)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  function handlePayClick(receipt: Receipt) {
    setSelectedReceipt(receipt)
    setShowPaymentModal(true)
  }

  function handlePaymentSuccess() {
    // Recargar la lista de recibos
    mutate()
    setShowPaymentModal(false)
    setSelectedReceipt(null)
  }

  function handleCloseModal() {
    setShowPaymentModal(false)
    setSelectedReceipt(null)
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold sm:ml-20 mt-10 mb-2 mx-6">
          Pago de acueducto
        </h1>
      </div>

      <div className="overflow-y-scroll w-[90%] flex-1 mx-auto max-md:pb-[72px]">
        {isLoading && (
          <div className="w-full flex justify-center py-20">
            <span className="loading loading-infinity loading-xl"></span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 mt-4">
            <p className="text-red-700">Ocurrió un error al cargar los recibos de pago</p>
          </div>
        )}

        {data && data.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ¡Todo al día!
            </h3>
            <p className="text-gray-500">No tienes facturas pendientes por pagar</p>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="space-y-4 py-4">
            {data.map((receipt) => (
              <ReceiptCardComponent
                receipt={receipt}
                key={receipt.id}
                onPay={handlePayClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de pago */}
      {showPaymentModal && selectedReceipt && (
        <PaymentModal
          receipt={selectedReceipt}
          onClose={handleCloseModal}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}