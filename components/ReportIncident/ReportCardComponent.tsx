"use client"

import { useState } from 'react'
import { Report } from "@/lib/Db/db";

interface ReportCardComponentProps{
  report: Report
}

export default function ReportCardComponent({report}:ReportCardComponentProps) {
  const [expanded, setExpanded] = useState(false)

  const statusColor = (status: string) => {
    switch (status) {
      case 'closed':
        return 'bg-green-100 text-green-800'
      case 'answered':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <article className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">{report.subject}</h3>
          <span className={`px-2 py-0.5 rounded text-sm ${statusColor(report.status)}`}>
            {report.status}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          <strong>Agente:</strong> {report.agent}
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Fecha:</strong> {new Date(report.dateCreated).toLocaleString()}
        </p>

        <div className="mt-3 text-gray-700 dark:text-gray-200 text-sm">
          {expanded ? (
            <>
              <div className="whitespace-pre-wrap"> <p className='font-bold'>Escribiste: </p> {report.reportContent}</div>
              {report.answer && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <h4 className="text-sm font-medium">Respuesta</h4>
                  <p className="text-sm mt-1 text-gray-700 dark:text-gray-200">{report.answer}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="line-clamp-3">{report.reportContent}</p>
              {report.answer && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Respuesta disponible</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-2 md:items-end">
        <button
          onClick={() => setExpanded(v => !v)}
          className="px-4 py-2 rounded-md font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 transition-colors"
        >
          {expanded ? 'Cerrar' : 'Ver'}
        </button>
      </div>
    </article>
  )
}