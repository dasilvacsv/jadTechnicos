import { signInTechnician } from "@/features/auth/technician-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench } from "lucide-react";

// Las páginas son Server Components por defecto.
// Recibimos 'searchParams' como prop para leer los parámetros de la URL.
export default function TechnicianSignInPage({ 
  searchParams 
}: { 
  searchParams: { error?: string } 
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        {/* El <form> ahora llama directamente a la server action */}
        <form action={signInTechnician}>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full w-fit mb-2">
              <Wrench className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Portal de Técnicos</CardTitle>
            <CardDescription>
              Ingresa con tu número de teléfono para acceder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Ej: 04121234567"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground">
                Deja este campo en blanco si es tu primer ingreso.
              </p>
            </div>
            {/* Si hay un error en la URL, lo mostramos aquí */}
            {searchParams.error && (
              <p className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md">
                {searchParams.error}
              </p>
            )}
          </CardContent>
          <CardFooter>
            {/* El botón ya no necesita un estado de "pending",
                el navegador se encarga de la transición */}
            <Button type="submit" className="w-full">
              Ingresar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}