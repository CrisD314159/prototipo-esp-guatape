'use client'

import useSWR from "swr"
import { UserInfo } from "@/lib/types/types"

export default function ReportIncidentComponent() {
  const { data, error, isLoading, mutate } = useSWR<{ userFriends: UserInfo[] }>('friendsList', ()=> void)


  return (
    <div className="flex flex-col h-screen w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold  sm:ml-20 mt-10 mb-2 mx-6">Tus reportes</h1>
      </div>
      <div className="overflow-y-scroll w-[90%] flex-1 mx-auto max-md:pb-[72px]">
      {isLoading && (
        <div className="w-full flex justify-center">
          <span className="loading loading-infinity loading-xl"></span>
        </div>
        )}
        {error && <p>There was an error while loading your friends</p>}
        {data &&
        (
          data.userFriends.map(user => {
            return (
              <FriendCard key={user.id} friend={user} mutate={mutate} blocked={false}/>
            )
          }
          )
        )
        }
      </div>
    </div>
  )
  
}