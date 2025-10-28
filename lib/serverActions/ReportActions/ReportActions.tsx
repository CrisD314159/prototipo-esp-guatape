import { FormResponse } from "@/lib/types/types";
import { getLoggedUserId } from "../Auth/Auth";
import { db} from "@/lib/Db/db";
import { generateGeminiReply } from "./ReportAIAnswer";

const agents =[
  "Valeria Torres",
  "Mateo Rivas",
  "Camila Duarte",
  "Julián Ortega",
  "Natalia Espinosa",
  "Sebastián Lozano",
  "Laura Cárdenas",
  "Andrés Molina"
]

export async function CreateReport(formstate: FormResponse, formdata: FormData ) {

  const userId = getLoggedUserId()
  
  try {
    const subject = formdata.get('subject')?.toString()
    const content = formdata.get('content')?.toString()

    if(!subject || !content) throw new Error("Fill all required values")

    const minCeiled = Math.ceil(0);
    const maxFloored = Math.floor(7);
    const randomAgentPosition = Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); 
    const agentName = agents[randomAgentPosition]

    const aiAnswer = await generateGeminiReply(subject, content)
    console.log(aiAnswer)

    await db.reports.add({
      subject: subject ?? '',
      reportContent: content ?? '',
      dateCreated: new Date().toISOString(),
      agent: agentName,
      answer:aiAnswer,
      userId: userId,
      status: 'closed'
    })

    return {
        success:true,
        message:"Report created successfully"
    }
  } catch (error) {
    if(error instanceof Error){
      return {
        success:false,
        message:error.message
      }
    }
    
  }
  return {
    success:false,
    message:"An unexpected error occured"
  }
}
export async function UpdateReport(formstate: FormResponse, formdata: FormData ){

  const subject = formdata.get('subject')?.toString()
  const content = formdata.get('content')?.toString()
  const reportId = Number.parseInt(formdata.get('reportId')?.toString() ?? '', 10)
  if (!reportId || Number.isNaN(reportId)) throw new Error('Invalid report id')

  const existing = await db.reports.get(reportId)
  if (!existing) throw new Error('Report not found')

  const updates = {
    subject: subject ?? existing.subject,
    reportContent: content ?? existing.reportContent,
  }

  await db.reports.update(reportId, updates)
}

export async function GetReports(){
  const userId = await getLoggedUserId()

  const reports = await db.reports.where('userId').equals(userId).toArray()
  return reports
}