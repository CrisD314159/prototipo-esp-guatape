import { db } from "@/lib/Db/db";
import { FormResponse } from "@/lib/types/types";
import { redirect } from "next/navigation";

export function getLoggedUserId(){
  const check = checkIsLoggedIn()
  if(!check) Logout()
  const id = localStorage.getItem('userId')
  if(!id) throw new Error("User id not found")
  return Number.parseInt(id, 10);
}

function setCookie(id: number) {
  localStorage.setItem('userId', id.toString())
}

export function Logout() {
  localStorage.clear()
  redirect('/')
}

export function checkIsLoggedIn() {
  // Check for a simple `userId` cookie and verify user exists in DB.
  try {
    const userId = localStorage.getItem('userId')
    if(userId){
      
      return true
    }
    return false
  } catch (error){
    console.log(error)
    
    return false
  }
}

export async function login(email: string, password: string) {
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

  setCookie(user.id!)
  return user
}


export async function CreateUser(formsatate: FormResponse, formdata: FormData) {
  // Create a user record in the local Dexie DB. Throws on error, returns new id.
  const name = formdata.get('name')?.toString()
  const email = formdata.get('email')?.toString()
  const address = formdata.get('address')?.toString()
  const password = formdata.get('password')?.toString()

  if(!name || !email || !address ){
    return {
      success: false,
      message: 'Fill all the required fields and try again'
    }
  }


  const existing = await db.users.where('email').equals(email).first()
  if (existing) {
    return {
      success: false,
      message: 'User already exists'
    }
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


  return {
    success:true,
    message: 'User created successfully'
  }
}
