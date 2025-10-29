import { db, Receipt } from "@/lib/Db/db"
import { getLoggedUserId } from "../Auth/Auth"
import { GetUseWaterControl } from "../WaterActions/WaterActions"

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PSE: 'pse', // Débito bancario Colombia
  NEQUI: 'nequi',
  DAVIPLATA: 'daviplata',
  CASH: 'cash'
} as const

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]

export type PaymentStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled'

interface PaymentSimulationResult {
  success: boolean
  status: PaymentStatus
  message: string
  transactionId?: string
  authorizationCode?: string
  processingTime: number
}

export async function simulatePaymentGateway(
  amount: number,
  paymentMethod: PaymentMethod,
  cardNumber?: string
): Promise<PaymentSimulationResult> {
  

  const processingTime = Math.floor(Math.random() * 2500) + 1500
  
  await new Promise(resolve => setTimeout(resolve, processingTime))

  // Simular diferentes escenarios (90% éxito, 10% fallo)
  const isSuccessful = Math.random() > 0.1

  // Simular rechazo si la tarjeta termina en ciertos números
  const shouldReject = cardNumber && ['0000', '9999', '1234'].includes(cardNumber.slice(-4))

  if (!isSuccessful || shouldReject) {
    const errorMessages = [
      'Fondos insuficientes',
      'Tarjeta rechazada por el banco',
      'Error de conexión con el banco',
      'Transacción no autorizada'
    ]
    
    return {
      success: false,
      status: 'rejected',
      message: errorMessages[Math.floor(Math.random() * errorMessages.length)],
      processingTime
    }
  }

  // Generar códigos realistas
  const transactionId = generateTransactionId()
  const authorizationCode = generateAuthCode()

  return {
    success: true,
    status: 'approved',
    message: 'Pago procesado exitosamente',
    transactionId,
    authorizationCode,
    processingTime
  }
}

// Generar ID de transacción realista
function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TRX-${timestamp}-${random}`
}

// Generar código de autorización
function generateAuthCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Función principal de pago mejorada
export async function PayReceipt(
  receiptId: number, 
  paymentMethod: PaymentMethod,
  cardNumber?: string,
) {
  const userId = getLoggedUserId()
  const receipt = await db.receipts.where('id').equals(receiptId).first()
  
  if (!receipt) throw new Error("Receipt not found")
  if (receipt.userId !== userId) throw new Error("Unauthorized")
  if (receipt.alreadyPaid) throw new Error("Receipt already paid")

  // Simular procesamiento con pasarela
  const paymentResult = await simulatePaymentGateway(
    receipt.total,
    paymentMethod,
    cardNumber
  )

  if (!paymentResult.success) {
    // Guardar intento fallido


    throw new Error(paymentResult.message)
  }

  // Pago exitoso - actualizar recibo
  await db.receipts.update(receipt.id, {
    alreadyPaid: true,
    paymentDate: new Date().toISOString(),
    paymentMethod,
    paymentId: paymentResult.transactionId,
    cardLastFour: cardNumber?.slice(-4)
  })

  await db.paymentAttempts.add({
    receiptId,
    userId,
    amount: receipt.total,
    paymentMethod,
    status: 'approved',
    message: paymentResult.message,
    attemptDate: new Date().toISOString(),
    transactionId: paymentResult.transactionId,
    authorizationCode: paymentResult.authorizationCode
  })


  return {
    success: true,
    message: 'Pago realizado exitosamente',
    transactionId: paymentResult.transactionId,
    authorizationCode: paymentResult.authorizationCode
  }
}

export async function GetPendingReceipts() {
  const userId = getLoggedUserId()
  const receipts: Receipt[] = await db.receipts
    .where('userId').equals(userId)
    .and(r => !r.alreadyPaid)
    .toArray()

  if (receipts.length === 0) {
    const waterUsage = await GetUseWaterControl()
    const baseRate = 5000
    const total = waterUsage.usage * baseRate
    
    const today = new Date()
    const payUntil = new Date(today)
    payUntil.setDate(today.getDate() + 30)

    // Generar número de factura realista
    const billNumber = generateBillNumber()

    const receiptId = await db.receipts.add({
      id:billNumber,
      total,
      waterUsage: waterUsage.usage,
      payUntil: payUntil.toISOString(),
      issueDate: today.toISOString(),
      alreadyPaid: false,
      paymentDate: "",
      paymentMethod: "",
      paymentId: "",
      cardLastFour: "",
      userId
    })

    const createdReceipt = await db.receipts.get(receiptId)
    if (createdReceipt) receipts.push(createdReceipt)
  }

  return receipts
}

export async function GetPaidReceipts() {
  const userId = getLoggedUserId()
  const receipts = await db.receipts
    .where('userId').equals(userId)
    .and(r => !!r.alreadyPaid)
    .reverse() // Más recientes primero
    .toArray()

  return receipts
}

// Obtener historial de intentos de pago
export async function GetPaymentHistory(receiptId?: number) {
  const userId = getLoggedUserId()
  
  if (receiptId) {
    return await db.paymentAttempts
      .where('receiptId').equals(receiptId)
      .and(attempt => attempt.userId === userId)
      .reverse()
      .toArray()
  }

  return await db.paymentAttempts
    .where('userId').equals(userId)
    .reverse()
    .limit(50)
    .toArray()
}

// Generar número de factura realista
function generateBillNumber(): number {
  const random = Math.floor(10000 + Math.random() * 90000)
  return random
}

// Validar tarjeta (simulado)
export function validateCard(cardNumber: string): { valid: boolean; brand?: string; message?: string } {
  // Quitar espacios y guiones
  const cleaned = cardNumber.replace(/[\s-]/g, '')
  
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: 'Solo se permiten números' }
  }

  if (cleaned.length < 13 || cleaned.length > 19) {
    return { valid: false, message: 'Longitud de tarjeta inválida' }
  }

  // Detectar marca por primeros dígitos (simulado)
  let brand = 'Unknown'
  if (/^4/.test(cleaned)) brand = 'Visa'
  else if (/^5[1-5]/.test(cleaned)) brand = 'Mastercard'
  else if (/^3[47]/.test(cleaned)) brand = 'American Express'
  else if (/^6(?:011|5)/.test(cleaned)) brand = 'Discover'


  return { valid:true, brand, message: 'Tarjeta válida'  }
}