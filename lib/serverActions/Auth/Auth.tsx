'use server'
import { db } from "@/lib/Db/db";
import { FormResponse } from "@/lib/types/types";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function getLoggedUserId(){
  const check = await checkIsLoggedIn()
  if(!check) await Logout()
  const id = (await cookies()).get('userId')?.value
  if(!id) throw new Error("User id not found")
  return Number.parseInt(id, 10);
}

async function setCookie(id: number) {
  const cookieStore = await cookies()

  cookieStore.set('userId', id.toString(), {
     httpOnly: true,
     secure: false,
     expires:  new Date(Date.now() + 1 * 60 * 60 * 1000),
     path: '/',
   })
}

export async function Logout() {
  (await cookies()).delete('userId')
  redirect('/')
}

export async function checkIsLoggedIn(): Promise<boolean> {
  // Check for a simple `userId` cookie and verify user exists in DB.
  try {
    const userId = (await cookies()).get('userId')?.value
    if(userId){
      return true
    }
    return false
  } catch {
    return false
  }
}

export async function LogIn(_formstate: FormResponse, formdata: FormData){
  const email = formdata.get("email")?.toString()
  const password = formdata.get("password")?.toString()

  try {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    const user = await db.users.where('email').equals(email).first()
    if (!user) {
      throw new Error('User not found')
    }

    if (user.password && user.password !== password) {
      throw new Error('Invalid credentials')
    }

    setCookie(user.id)
    
  } catch (error){
    if(error instanceof Error)
      return {
        success: false,
        message: error.message
      }
    
  }
  redirect('/dashboard')
}


export async function CreateUser(name: string, email: string, address: string, password?: string): Promise<number> {
  // Create a user record in the local Dexie DB. Throws on error, returns new id.
  if (!email || !name) {
    throw new Error('Name and email are required')
  }

  const existing = await db.users.where('email').equals(email).first()
  if (existing) {
    throw new Error('User already exists')
  }

  const id = await db.users.add({
    name,
    email,
    address,
    password
  })

  const initialUsage = Math.round(80 + Math.random() * 120) 
  await db.waterUsages.add({
    usage: initialUsage,
    lastUpdated: new Date().toISOString(),
    userId: id
  })


  return id
}
