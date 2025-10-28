import { db, Receipt } from "@/lib/Db/db"
import { getLoggedUserId } from "../Auth/Auth"
import { GetUseWaterControl } from "../WaterActions/WaterActions"

export async function PayReceipt(receiptId: number) {
  const userId = await getLoggedUserId()
  const receipt = await db.receipts.where('id').equals(receiptId).first()
  if(receipt?.userId != userId) throw new Error("Payment not found")
  if(receipt.alreadyPaid) throw new Error("Payment already paid")

  await db.receipts.update(receipt.id, {alreadyPaid: true})
}

export async function GetPendingReceipts() {
  const userId = getLoggedUserId()

  const receipts:Receipt[] = await db.receipts.where('userId').equals(userId).and((r) => !r.alreadyPaid).toArray()

  if(receipts.length === 0){
    const waterUsage = await GetUseWaterControl()
    const total = waterUsage.usage * 5000
    const today = new Date();      
    const diasASumar = 30;      
    const payUntil = new Date(today);
    payUntil.setDate(today.getDate() + diasASumar);

    const receiptId = await db.receipts.add({
      total,
      payUntil:payUntil.toISOString(),
      alreadyPaid:false,
      paymentDate:"",
      userId
    })

    const createdReceipt = await db.receipts.get(receiptId)
    if(createdReceipt)
      receipts.push(createdReceipt)
  }

  return receipts
}

export async function GetPaidReceipts() {
  const userId = getLoggedUserId()

  const receipts = await db.receipts.where('userId').equals(userId).and((r) => !!r.alreadyPaid).toArray()

  return receipts
} 
