"use client"

import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckSquare, Shield, Package } from "lucide-react"; // Se añadió Package para 'Entregadas'

interface MetricsCardsProps {
  metrics: {
    total: number;
    pending: number;
    completed: number;
    delivered: number;
    warranty: number;
  };
  totalOrders: number;
  hasActiveFilters: boolean;
}

// Componente para una tarjeta individual para evitar repetición de código
const MetricCard = ({ icon, title, value, colorClass, subtext }: {
  icon: React.ReactNode;
  title: string;
  value: number;
  colorClass: string;
  subtext?: string;
}) => (
  <Card className={`border-l-4 ${colorClass}`}>
    <CardContent className="p-3 flex items-center justify-between">
      <div>
        <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
          {title}
        </CardTitle>
        <p className="text-2xl font-bold">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
      </div>
      <div className={`p-2 bg-opacity-10 rounded-lg ${colorClass.replace('border-l-', 'bg-')}`}>
        {icon}
      </div>
    </CardContent>
  </Card>
);


export function MetricsCards({ metrics, totalOrders, hasActiveFilters }: MetricsCardsProps) {
  const totalPercentage = (value: number) => {
    if (metrics.total === 0) return '0%';
    return `${Math.round((value / metrics.total) * 100)}% del total`;
  };
  
  const filterSubtext = hasActiveFilters ? `de ${totalOrders}` : undefined;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
      <MetricCard
        title="Totales"
        value={metrics.total}
        icon={<FileText className="h-5 w-5 text-blue-500" />}
        colorClass="border-l-blue-500"
        subtext={filterSubtext}
      />
      <MetricCard
        title="Pendientes"
        value={metrics.pending}
        icon={<Clock className="h-5 w-5 text-amber-500" />}
        colorClass="border-l-amber-500"
        subtext={totalPercentage(metrics.pending)}
      />
      <MetricCard
        title="Completadas"
        value={metrics.completed}
        icon={<CheckSquare className="h-5 w-5 text-green-500" />}
        colorClass="border-l-green-500"
        subtext={totalPercentage(metrics.completed)}
      />
       <MetricCard
        title="Entregadas"
        value={metrics.delivered}
        icon={<Package className="h-5 w-5 text-slate-500" />}
        colorClass="border-l-slate-500"
        subtext={totalPercentage(metrics.delivered)}
      />
      <MetricCard
        title="En Garantía"
        value={metrics.warranty}
        icon={<Shield className="h-5 w-5 text-purple-500" />}
        colorClass="border-l-purple-500"
        subtext={totalPercentage(metrics.warranty)}
      />
    </div>
  );
}