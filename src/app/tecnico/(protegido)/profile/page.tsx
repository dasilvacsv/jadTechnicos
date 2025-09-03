import { auth } from "@/features/auth";
import { db } from "@/db";
import { technicians } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// Importamos las nuevas funciones y componentes
import { getTechnicianProfileStats } from "@/features/tecnicos/actions";
import { ProfileClientPage } from "./ProfileClientPage";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/tecnico/sign-in");
  }

  // Obtenemos los datos básicos y las estadísticas en paralelo
  const [technician, stats] = await Promise.all([
    db.query.technicians.findFirst({ where: eq(technicians.id, session.user.id) }),
    getTechnicianProfileStats(session.user.id)
  ]);

  if (!technician) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>No se pudo encontrar la información del técnico.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>
      {/* Renderizamos el componente de cliente pasándole los datos del servidor */}
      <ProfileClientPage technician={technician} stats={stats} />
    </div>
  );
}