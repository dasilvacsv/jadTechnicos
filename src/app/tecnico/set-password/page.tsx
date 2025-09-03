"use client"; // <-- PASO 1: ASEGÚRATE QUE ESTA LÍNEA ESTÉ AL INICIO

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTechnicianPassword } from "@/features/auth/technician-auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound } from "lucide-react";

// Creamos un componente interno para poder usar useSearchParams
function SetPasswordFormComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [technicianId, setTechnicianId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      setTechnicianId(id);
    } else {
      router.replace("/tecnico/sign-in");
    }
  }, [searchParams, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!technicianId) {
      setError("No se pudo identificar al técnico. Intenta iniciar sesión de nuevo.");
      return;
    }

    setIsLoading(true);
    const result = await setTechnicianPassword(technicianId, password);

    if (result?.error) {
      setError(result.error);
    } else {
      toast({
        title: "¡Contraseña Creada!",
        description: "Tu contraseña ha sido guardada. Ahora puedes iniciar sesión.",
        variant: "default",
      });
      router.push("/tecnico/sign-in");
    }
    setIsLoading(false);
  };

  if (!technicianId) {
    return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
  }

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full w-fit mb-2">
            <KeyRound className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Crea tu Contraseña</CardTitle>
          <CardDescription>
            Establece una contraseña segura para acceder a tu portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} />
          </div>
          {error && (
            <p className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Guardando..." : "Guardar Contraseña"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// Envolvemos el componente en Suspense para que useSearchParams funcione correctamente
export default function SetPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary"/>}>
                <SetPasswordFormComponent />
            </Suspense>
        </div>
    )
}