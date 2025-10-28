'use client'

import useSWR from "swr"
import { CreateReport, GetReports } from "@/lib/serverActions/ReportActions/ReportActions"
import { Report } from "@/lib/Db/db"
import ReportCardComponent from "./ReportCardComponent"
import FormDialog from "../Dialogs/FormDialog"

export default function ReportIncidentComponent() {
  const { data, error, isLoading, mutate } = useSWR<Report[]>('friendsList', GetReports)


  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold  sm:ml-20 mt-10 mb-2 mx-6">Tus reportes</h1>
      </div>
      <div className="overflow-y-scroll w-[90%] flex-1 mx-auto pb-[150px]">
      {isLoading && (
        <div className="w-full flex justify-center">
          <span className="loading loading-infinity loading-xl"></span>
        </div>
        )}
        {error && <p>There was an error while loading your friends</p>}
        {data &&
        (
          data.map(report => {
            return (
              <ReportCardComponent report={report} key={report.id}/>
            )
          }
          )
        )
        }
      </div>
      <div className="w-full flex justify-center h-10 absolute bottom-30">
        <FormDialog SubmitMethod={CreateReport} inputName="Create Report" mutate={mutate} />
      </div>

    </div>
  )
  
}