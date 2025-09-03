import { getTechnicians, getTechniciansWithWarrantyStats } from "@/features/tecnicos/technicians"
import { columns } from "@/features/tecnicos/columns"
import { TechniciansPage } from "@/features/tecnicos/technicians-page2"

// Force dynamic to avoid caching issues
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TechniciansPageContainer() {
  const { data, error } = await getTechnicians()
  const { data: techniciansWithWarranty, error: warrantyError } = await getTechniciansWithWarrantyStats() || { data: [] }
  
  return (
    <TechniciansPage 
      initialTechnicians={data || null} 
      initialTechniciansWithWarranty={techniciansWithWarranty || null}
      initialError={error}
      initialWarrantyError={warrantyError}
    />
  )
}