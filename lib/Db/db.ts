import Dexie, { type EntityTable } from 'dexie';

export interface User {
  id: number;
  name: string;
  email:string
  address:string;
  password?: string;

}

export interface PaymentAttempt {
  id: number
  receiptId: number
  userId: number
  amount: number
  paymentMethod: string
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled'
  message: string
  attemptDate: string
  transactionId?: string
  authorizationCode?: string
}

export interface WaterUsage{
  id:number
  usage:number
  lastUpdated:string
  userId:number
}

export interface Receipt{
  id:number
  total:number
  payUntil:string
  alreadyPaid:boolean
  paymentDate:string
  paymentMethod:string
  paymentId: string
  cardLastFour:string
  waterUsage: number
  issueDate:string
  userId:number
}

export interface Report{
  id:number
  subject:string
  reportContent:string
  dateCreated:string
  agent: string
  answer:string
  userId:number,
  status:string
}

export const db = new Dexie('ESPGuatapeDatabase') as Dexie & {
  users: EntityTable<
    User,
    'id' // primary key "id" (for the typings only)
  >
  waterUsages: EntityTable<
    WaterUsage,
    'id' // primary key "id" (for the typings only)
  >;
  receipts: EntityTable<
    Receipt,
    'id' // primary key "id" (for the typings only)
  >;
  reports: EntityTable<
    Report,
    'id' // primary key "id" (for the typings only)
  >;
  paymentAttempts: EntityTable<
    PaymentAttempt,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  users: '++id, name, email, address, password ', // primary key "id" (for the runtime!)
  waterUsages: '++id, usage, lastUpdated, userId', // primary key "id" (for the runtime!)
  receipts: '++id, total, payUntil, alreadyPaid, paymentDate, userId, paymentMethod, paymentId, cardLastFour, waterUsage, issueDate', // primary key "id" (for the runtime!)
  reports: '++id, subject, reportContent, dateCreated, agent, answer, userId, status', // primary key "id" (for the runtime!),
  paymentAttempts:'++id, receiptId, userId, amount, paymentMehod, status, message, attemptDate, transactionId, authorizationCode '
});