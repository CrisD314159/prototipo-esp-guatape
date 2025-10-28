'use client'
import DockComponent from "@/components/Dock/DockComponent";
import TabComponent from "@/components/Dock/TabComponent";
import { Activity, Receipt, Flag } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ReportsMainComponentDynamic = dynamic(()=> import ("@/components/ReportIncident/ReportIncidentComponent"), {
  ssr:false
}) 
const WaterControlComponentDynamic = dynamic(()=> import ("@/components/WaterControl/WaterControlComponent"), {
  ssr:false
}) 

const PaymentComponentDynamic = dynamic(()=> import ("@/components/ReceiptsPayment/ReceiptsPaymentComponent"), {
  ssr:false
}) 
export default function DashboardPage() {
  return (
    <Suspense>
      <DockComponent>
        <TabComponent title="WaterControl" icon={Activity} tabkey="water">
          <Suspense fallback={<span className="loading loading-infinity loading-xl"></span>}>
            <WaterControlComponentDynamic/>
          </Suspense>
        </TabComponent>
        <TabComponent title="Payment" icon={Receipt} tabkey="payment">
          <Suspense fallback={<span className="loading loading-infinity loading-xl"></span>}>
            <PaymentComponentDynamic/>
          </Suspense>
        </TabComponent>
        <TabComponent title="Reports" icon={Flag} tabkey="reports">
          <Suspense fallback={<span className="loading loading-infinity loading-xl"></span>}>
            <ReportsMainComponentDynamic/>
          </Suspense>
        </TabComponent>
      </DockComponent>
    </Suspense>
  )
}