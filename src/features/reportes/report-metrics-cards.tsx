"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleDashed, List, XCircle } from "lucide-react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

// ====================================================================
// ✨ SUB-COMPONENTE: Contador Animado
// ====================================================================
// Este componente se encarga de la animación del número para un efecto dinámico.
function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  // Transforma el valor flotante de la animación a un entero redondeado.
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    // Anima el 'count' desde su valor actual hasta el nuevo 'value'.
    const controls = animate(count, value, {
      duration: 1, // Duración de la animación en segundos
      ease: "easeOut", // Efecto de desaceleración suave
    });
    // Detiene la animación si el componente se desmonta.
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

// ====================================================================
// ✨ COMPONENTE PRINCIPAL MEJORADO
// ====================================================================
interface ReportMetricsCardsProps {
  totales: number;
  terminadas: number;
  pendientes: number;
  canceladas: number;
}

export function ReportMetricsCards({
  totales,
  terminadas,
  pendientes,
  canceladas,
}: ReportMetricsCardsProps) {
  const metrics = [
    {
      title: "Órdenes Totales",
      value: totales,
      icon: List,
      color: "text-blue-500",
      description: "Todas las órdenes filtradas.",
    },
    {
      title: "Pendientes",
      value: pendientes,
      icon: CircleDashed,
      color: "text-amber-500",
      description: "En progreso o por iniciar.",
    },
    {
      title: "Terminadas",
      value: terminadas,
      icon: CheckCircle2,
      color: "text-green-500",
      description: "Completadas exitosamente.",
    },
    {
      title: "Canceladas",
      value: canceladas,
      icon: XCircle,
      color: "text-red-500",
      description: "No aprobadas o anuladas.",
    },
  ];

  return (
    // Se mantiene el excelente grid responsive que ya tenías.
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        // ✨ UI/UX: Se añade un efecto sutil de hover para mayor interactividad.
        // Se usa la estructura estándar de CardHeader/CardContent para consistencia.
        <Card
          key={metric.title}
          className="shadow-sm transition-transform duration-200 hover:scale-[1.03] hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <metric.icon className={cn("h-5 w-5", metric.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* Se utiliza el nuevo contador animado */}
              <AnimatedCounter value={metric.value} />
            </div>
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}