import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getTechnicianById } from "@/features/tecnicos/technicians"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/features/auth"
import { TechnicianDetail } from "@/features/tecnicos/technician-detail"

// Force dynamic to avoid caching issues
export const dynamic = "force-dynamic"
export const revalidate = 0;

interface TechnicianPageProps {
  params: {
    id: string
  }
}

export default async function TechnicianPage({ params }: TechnicianPageProps) {
  const session = await auth()
  if (!session?.user) return notFound()

  const userId = session.user.id
  const { id } = params

  // Fetch technician data
  const result = await getTechnicianById(id)
  
  if (!result.success || !result.data) {
    return notFound()
  }

  // Validate technician data structure
  const isValidData = result.data.technician && 
                     typeof result.data.technician === 'object' && 
                     result.data.technician.id && 
                     result.data.technician.name;
                     
  if (!isValidData) {
    // If the technician data is invalid, render a not found page
    console.error("Invalid technician data structure:", result.data);
    return notFound();
  }

  return (
    <div className="container py-6 space-y-6">
      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <TechnicianDetail 
          technicianData={result.data} 
          userId={userId} 
        />
      </Suspense>
    </div>
  )
}