"use server"

import { storefrontClient } from "clients/storefrontClient"
import { PlatformUserCreateInput } from "@enterprise-commerce/core/platform/types"
import { cookies } from "next/headers"
import internalClient from "clients/internalClient"
import { COOKIE_ACCESS_TOKEN } from "constants/index"

export async function registerUser({ email, password }: { email: string; password: string }) {
  // Swapped storefrontClient for internalClient
  const user = await internalClient.createUser({ email, password }) 
  return user
}

export async function loginUser({ email, password }: { email: string; password: string }) {
  // Swapped storefrontClient for internalClient
  const user = await internalClient.createUserAccessToken({ email, password }) 
  cookies().set(COOKIE_ACCESS_TOKEN, user?.accessToken || "", { expires: new Date(user?.expiresAt || "") })
  return user
}

// For Task 1, you can leave the getCurrentUser() function below as it is. 
export async function getCurrentUser() {
  const accessToken = cookies().get(COOKIE_ACCESS_TOKEN)?.value
  // Swapped storefrontClient for internalClient
  const user = await internalClient.getUser(accessToken || "") 
  return user
}

// disregard the updateUser function, someone else is working on it
export async function updateUser(input: PlatformUserCreateInput) {
  const accessToken = cookies().get(COOKIE_ACCESS_TOKEN)?.value

  // Left this as storefrontClient since another dev is handling it
  const user = await storefrontClient.updateUser(accessToken!, { ...input })
  return user
}

export async function logoutUser() {
  cookies().delete(COOKIE_ACCESS_TOKEN)
}
