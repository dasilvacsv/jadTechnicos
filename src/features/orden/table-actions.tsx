"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileDown, Users, Loader2, Wrench, LayoutGrid } from "lucide-react" // <-- ICONO AÑADIDO
import { Row } from "@tanstack/react-table"
import { ServiceOrder } from "./service-order"
import { toast } from "@/hooks/use-toast"
import { 
  generateSimplePdfAction, 
  generateGroupedPdfAction, 
  generateServicesByTechnicianPdfAction,
  generateReportByStatusPdfAction // <-- NUEVA IMPORTACIÓN
} from "./pdf-actions"
import { saveAs } from 'file-saver'

// Función helper para decodificar y descargar
const downloadPdfFromBase64 = (base64String: string, fileName: string) => {
  const byteCharacters = atob(base64String)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: 'application/pdf' })
  saveAs(blob, fileName)
};

interface TableActionsProps {
  filteredRows: Row<ServiceOrder>[]
}

export function TableActions({ filteredRows }: TableActionsProps) {
  // AÑADIR NUEVO ESTADO DE CARGA
  const [isGenerating, setIsGenerating] = useState<null | 'simple' | 'grouped' | 'services' | 'reportByStatus'>(null)

  const handleGenerateSimple = async () => {
    if (isGenerating || filteredRows.length === 0) return

    setIsGenerating('simple')
    toast({ title: "Iniciando exportación...", description: "El servidor está generando tu PDF." })
    
    try {
      const orders = filteredRows.map(row => row.original)
      const serializableOrders = JSON.parse(JSON.stringify(orders))

      const base64Pdf = await generateSimplePdfAction(serializableOrders)
      
      downloadPdfFromBase64(base64Pdf, `reporte_ordenes_${new Date().toISOString().split('T')[0]}.pdf`)
      toast({ title: "¡PDF Listo!", description: "La descarga ha comenzado." })
    } catch (error) {
      console.error("Error en Server Action (Simple PDF):", error)
      toast({ title: "Error", description: "No se pudo generar el PDF en el servidor.", variant: "destructive" })
    } finally {
      setIsGenerating(null)
    }
  }

  const handleGenerateGrouped = async () => {
    if (isGenerating || filteredRows.length === 0) return

    setIsGenerating('grouped')
    toast({ title: "Iniciando reporte...", description: "El servidor está agrupando los datos." })

    try {
      const orders = filteredRows.map(row => row.original)
      const serializableOrders = JSON.parse(JSON.stringify(orders))

      const base64Pdf = await generateGroupedPdfAction(serializableOrders)

      if (base64Pdf === "NO_DATA") {
        return
      }
      
      downloadPdfFromBase64(base64Pdf, `reporte_tecnicos_garantia_${new Date().toISOString().split('T')[0]}.pdf`)
      toast({ title: "¡Reporte Listo!", description: "La descarga ha comenzado." })
    } catch (error) {
      console.error("Error en Server Action (Grouped PDF):", error)
      toast({ title: "Error", description: "No se pudo generar el reporte.", variant: "destructive" })
    } finally {
      setIsGenerating(null)
    }
  }

  const handleGenerateServices = async () => {
    if (isGenerating || filteredRows.length === 0) return

    setIsGenerating('services')
    toast({ title: "Iniciando reporte de servicios...", description: "El servidor está agrupando los servicios por técnico." })

    try {
      const orders = filteredRows.map(row => row.original)
      const serializableOrders = JSON.parse(JSON.stringify(orders))

      const base64Pdf = await generateServicesByTechnicianPdfAction(serializableOrders)

      if (base64Pdf === "NO_DATA") {
        return
      }
      
      downloadPdfFromBase64(base64Pdf, `reporte_servicios_tecnicos_${new Date().toISOString().split('T')[0]}.pdf`)
      toast({ title: "¡Reporte Listo!", description: "La descarga ha comenzado." })
    } catch (error) {
      console.error("Error en Server Action (Services PDF):", error)
      toast({ title: "Error", description: "No se pudo generar el reporte de servicios.", variant: "destructive" })
    } finally {
      setIsGenerating(null)
    }
  }

  // NUEVO MANEJADOR PARA EL REPORTE AGRUPADO
  const handleGenerateReportByStatus = async () => {
    if (isGenerating || filteredRows.length === 0) return

    setIsGenerating('reportByStatus')
    toast({ title: "Generando Reporte Agrupado...", description: "El servidor está procesando los datos." })

    try {
      const orders = filteredRows.map(row => row.original)
      const serializableOrders = JSON.parse(JSON.stringify(orders))

      const base64Pdf = await generateReportByStatusPdfAction(serializableOrders)

      if (base64Pdf === "NO_DATA") {
        toast({ title: "No hay datos", description: "No se encontraron órdenes para generar el reporte.", variant: "default" })
        return
      }
      
      downloadPdfFromBase64(base64Pdf, `reporte_por_estado_y_tecnico_${new Date().toISOString().split('T')[0]}.pdf`)
      toast({ title: "¡Reporte Listo!", description: "La descarga ha comenzado." })
    } catch (error) {
      console.error("Error en Server Action (Report by Status PDF):", error)
      toast({ title: "Error", description: "No se pudo generar el reporte agrupado.", variant: "destructive" })
    } finally {
      setIsGenerating(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={!!isGenerating || filteredRows.length === 0}>
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleGenerateSimple} disabled={!!isGenerating}>
          {isGenerating === 'simple' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
          <span>Exportar Vista Actual</span>
        </DropdownMenuItem>
        
        {/* NUEVA OPCIÓN DE MENÚ */}
        <DropdownMenuItem onClick={handleGenerateReportByStatus} disabled={!!isGenerating}>
          {isGenerating === 'reportByStatus' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LayoutGrid className="mr-2 h-4 w-4" />}
          <span>Exportar Reporte por Estado</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleGenerateServices} disabled={!!isGenerating}>
          {isGenerating === 'services' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
          <span>Servicios por Técnico</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleGenerateGrouped} disabled={!!isGenerating}>
          {isGenerating === 'grouped' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
          <span>Agrupar Garantías por Técnico</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}