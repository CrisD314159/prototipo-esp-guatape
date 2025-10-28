'use client'

import { useState } from 'react'
import { Receipt, db } from "@/lib/Db/db"

interface ReceiptCardComponentProps {
  receipt: Receipt
  mutate: () => void
  paidCard:boolean
}

export default function ReceiptCardComponent({ receipt, mutate }: ReceiptCardComponentProps) {
  const [loading, setLoading] = useState(false)
  const [paid, setPaid] = useState<boolean>(!!receipt.alreadyPaid)
  const [paymentDate, setPaymentDate] = useState<string | null>(receipt.paymentDate ?? null)

  async function handlePay() {
    if (paid) return
    const ok = confirm("Estas seguro de pagar tu factura?")
    if(!ok) return
      setLoading(true)
    try {
      const now = new Date().toISOString()
      await db.receipts.update(receipt.id, { alreadyPaid: true, paymentDate: now })
      setPaid(true)
      setPaymentDate(now)
      mutate()
    } catch (err) {
      // for demo keep it simple; in production show toast/error UI
      // console.error(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Recibo #{receipt.id}</h3>
          <span className={`px-2 py-0.5 rounded text-sm ${paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {paid ? 'Pagado' : 'Pendiente'}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Total: <strong>{receipt.total}</strong>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Vence: <strong>{receipt.payUntil ?? '—'}</strong>
        </p>
        {paymentDate && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Pagado el: {new Date(paymentDate).toLocaleString()}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handlePay}
          disabled={paid || loading}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${paid ? 'bg-gray-300 text-gray-700 cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {loading ? 'Procesando...' : 'Pagar'}
        </button>
      </div>
    </article>
  )
}