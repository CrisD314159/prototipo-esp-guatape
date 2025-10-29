'use client'

import { motion, AnimatePresence } from "framer-motion"
import { startTransition, useActionState, useEffect, useState } from "react"
import { X } from "lucide-react"
import { FormResponse } from "@/lib/types/types"
import { Plus } from 'lucide-react';
import toast from "react-hot-toast"
import { Report } from "@/lib/Db/db"

interface TextInputModalProps {
  SubmitMethod: (formstate: FormResponse, formdata: FormData) => Promise<{
    success: boolean;
    message: string;  
  }>
  title?: string
  placeholder?: string,
  entity?: Report,
  entityIdKey?: string,
  inputName: string
  mutate: () => void
}

export default function FormDialog({
  SubmitMethod,
  entity,
  entityIdKey,
  mutate
}: TextInputModalProps) {

  const [state, action, isPending] = useActionState(SubmitMethod, undefined);
  const [open, setOpen] = useState(false)

  const handleOpen = () =>{
    setOpen(true)

  }
  const handleClose = () =>{
    setOpen(false)

  }

  useEffect(()=>{
    if(state?.success === false) toast.error(state.message)
    if(state?.success === true) {
      mutate()
      toast.success(state.message)
      startTransition(()=> {
        setOpen(false)
      })
    }

  }, [state, mutate])


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault()
    toast.loading("Resolviendo tu reporte usando IA", {duration:6000})
  

    const formdata = new FormData(e.currentTarget)
    if(entityIdKey && entity){
      formdata.append(entityIdKey, entity.id.toString())
    }

    startTransition(()=> {
      action(formdata)
    })
    

  }



  return (
    <>
    <button className="btn btn-soft btn-primary rounded-full" onClick={handleOpen}>
      <Plus/>
    </button>
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-box w-full max-w-md bg-base-100 shadow-lg rounded-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Nuevo reporte</h3>
              <button onClick={handleClose} className="btn btn-sm btn-ghost">
                <X className="w-5 h-5" />
              </button>
            </div>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="subject"
              placeholder="Asunto"
              className="input input-bordered w-full mb-4"
              required
            />

            <input
              type="text"
              name="content"
              placeholder="Motivo"
              className="input input-bordered w-full mb-4"
              required
            />

            <div className="modal-action">
              <button className="btn btn-primary" disabled={isPending}>
                Enviar
              </button>
            </div>

          </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}