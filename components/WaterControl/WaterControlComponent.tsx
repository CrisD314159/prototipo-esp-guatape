'use client'

import useSWR from "swr"
import { WaterUsage } from "@/lib/Db/db"
import { GetUseWaterControl } from "@/lib/serverActions/WaterActions/WaterActions"

export default function WaterControlComponent() {
  const { data, error, isLoading, mutate } = useSWR<WaterUsage>(
    'waterUsage',
    GetUseWaterControl,
    { refreshInterval: 60000, revalidateOnFocus: true, fallbackData: undefined }
  )


  return (
    <div className="flex flex-col min-h-screen w-full p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-3 sm:mb-0">Control de acueducto</h1>
        <div className="flex gap-2">
          <button
            onClick={() => mutate()}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm"
          >
            Refrescar
          </button>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        {isLoading && (
          <div className="w-full flex justify-center py-8">
            <span className="loading loading-infinity loading-xl"></span>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-red-700 dark:text-red-200">Error al cargar datos.</p>
          </div>
        )}

        {data && (
          <section className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">Consumo (litros)</p>
              <h2 className="text-4xl font-extrabold mt-1">{data.usage ?? 0}</h2>

              <div className="mt-3 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <span>Última actualización: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : '—'}</span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-300">Usuario: {data.userId}</div>
              <button
                onClick={() => mutate()}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Actualizar ahora
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}