'use client'
import useSWR from "swr"
import { Receipt } from "@/lib/Db/db"
import { GetPendingReceipts } from "@/lib/serverActions/ReceiptsActions/ReceiptsActions"
import ReceiptCardComponent from "./ReceiptCardComponent"

export default function ReceiptsPaymentComponent() {
  const { data, error, isLoading, mutate } = useSWR<Receipt[]>('receipts', GetPendingReceipts)


  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold  sm:ml-20 mt-10 mb-2 mx-6">Pago de acueducto</h1>
      </div>
      <div className="overflow-y-scroll w-[90%] flex-1 mx-auto max-md:pb-[72px]">
      {isLoading && (
        <div className="w-full flex justify-center">
          <span className="loading loading-infinity loading-xl"></span>
        </div>
        )}
        {error && <p>Ocurrio un error al cargar los recibos de pago</p>}
        {data &&
        (
          data.map(receipt => {
            return (
              <ReceiptCardComponent receipt={receipt} key={receipt.id} mutate={mutate} paidCard/>
            )
          }
          )
        )
        }
      </div>
    </div>
  )
  
}