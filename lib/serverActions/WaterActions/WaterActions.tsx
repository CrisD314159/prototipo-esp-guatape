
import { db } from "@/lib/Db/db";
import { getLoggedUserId } from "../Auth/Auth"

export async function GetUseWaterControl() {
  const userId = getLoggedUserId();
 

  const userWaterUsage = await db.waterUsages.where('userId').equals(userId).first();

  const delta = Math.random() * (40 - (-40)) + (-40);

  if(!userWaterUsage) throw new Error("No usage found");
  let newUsage = (userWaterUsage.usage ?? 0) + delta;
  if(newUsage < 5) newUsage = 70.8723846234


  await db.waterUsages.update(userWaterUsage.id, { usage: newUsage });

  return userWaterUsage
}