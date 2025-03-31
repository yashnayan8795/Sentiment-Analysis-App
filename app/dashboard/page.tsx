import PowerBIDashboard from "@/components/power-bi-dashboard"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <PowerBIDashboard 
        reportId="YOUR_REPORT_ID"
        workspaceId="YOUR_WORKSPACE_ID"
      />
    </div>
  )
} 