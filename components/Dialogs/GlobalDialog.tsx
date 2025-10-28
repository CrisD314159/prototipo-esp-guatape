'use client'

import { Receipt, Report } from "@/lib/Db/db"
import { LucideProps } from "lucide-react"
import { ForwardRefExoticComponent, RefAttributes, useState } from "react"
import toast from "react-hot-toast"


interface GlobalDialogProps{
  title: string
  entity: Receipt | Report
  Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
  method: (param:number) => Promise<void>
  actionButtonName: string 
  mutate: () => void
}

export default function GlobalDialog({actionButtonName, Icon, method, title, entity, mutate}:GlobalDialogProps) {

  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false) 

  const handleOpen = () =>{
    setOpen(true)
  }
  const handleClose = () =>{
    setOpen(false)
  }

  const handleActionMethod = async () =>{
    try {
      setPending(true)
      await method(entity.id)
      mutate()
      handleClose()
      
    } catch (error) {
      if(error instanceof Error)
        toast.error(error.message)
    }finally{
      setPending(false)
    }
  }

  return (
    <>
      <button className="btn btn-soft btn-error" onClick={handleOpen}><Icon/></button>
      <dialog id="my_modal_1" className="modal" open ={open} onClose={handleClose}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{title}</h3>
          <div className="modal-action ">
            <button className="btn btn-soft btn-error" onClick={handleClose}>Cancel</button>
            <button className="btn btn-soft btn-info" disabled={pending} onClick={async ()=>{
              await handleActionMethod()
              handleClose()
            } }>{actionButtonName}</button>
          </div>
        </div>
      </dialog>
    </>
  )
}