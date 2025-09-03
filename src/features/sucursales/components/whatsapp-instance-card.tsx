"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, QrCode as Qr, Trash2, RefreshCw, Wifi, WifiOff, Loader2, Plus, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QRCode from "qrcode"
import {
  createSucursalWhatsAppInstance,
  connectSucursalWhatsAppInstance,
  checkSucursalWhatsAppConnection,
  getSucursalWhatsAppInstance,
  deleteSucursalWhatsAppInstance
} from "../whatsapp-instance-actions"

interface WhatsAppInstanceCardProps {
  sucursalId: string
  sucursalName: string
  userId: string
  initialStatus?: {
    hasInstance: boolean
    instanceName?: string | null
    status: string
    lastConnection?: Date | null
  }
}

export function WhatsAppInstanceCard({ 
  sucursalId, 
  sucursalName, 
  userId,
  initialStatus 
}: WhatsAppInstanceCardProps) {
  const [instanceInfo, setInstanceInfo] = useState(initialStatus || {
    hasInstance: false,
    status: "disconnected"
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const { toast } = useToast()

  // Check connection status periodically
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (instanceInfo.hasInstance) {
      // Check immediately
      checkConnectionStatus()
      
      // Then check every 30 seconds
      interval = setInterval(checkConnectionStatus, 30000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [instanceInfo.hasInstance, sucursalId])

  const checkConnectionStatus = async () => {
    if (!instanceInfo.hasInstance) return

    const result = await checkSucursalWhatsAppConnection(sucursalId)
    if (result.success) {
      setInstanceInfo(prev => ({
        ...prev,
        status: result.status || "disconnected"
      }))
    }
  }

  const refreshInstanceInfo = async () => {
    setIsLoading(true)
    try {
      const result = await getSucursalWhatsAppInstance(sucursalId)
      if (result.success && result.data) {
        setInstanceInfo(result.data)
      }
    } catch (error) {
      console.error("Error refreshing instance info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createInstance = async () => {
    setIsLoading(true)
    try {
      const result = await createSucursalWhatsAppInstance(sucursalId, userId)
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message,
        })
        
        // Update local state
        setInstanceInfo({
          hasInstance: true,
          instanceName: result.instanceName,
          status: "connecting"
        })
        
        // Automatically show QR code
        setTimeout(() => {
          handleConnect()
        }, 1000)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al crear la instancia",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    setIsGeneratingQR(true)
    setShowQRDialog(true)
    
    try {
      const result = await connectSucursalWhatsAppInstance(sucursalId)
      
      if (result.success && result.qrcode) {
        const qrCodeDataUrl = await QRCode.toDataURL(result.qrcode, {
          width: 300,
          margin: 2,
        })
        setQrCode(qrCodeDataUrl)
        
        setInstanceInfo(prev => ({
          ...prev,
          status: "connecting"
        }))
        
        toast({
          title: "Código QR generado",
          description: "Escanea el código QR con WhatsApp",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "No se pudo generar el código QR",
        })
        setShowQRDialog(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al generar el código QR",
      })
      setShowQRDialog(false)
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la instancia de WhatsApp para ${sucursalName}?`)) {
      return
    }

    setIsLoading(true)
    try {
      const result = await deleteSucursalWhatsAppInstance(sucursalId, userId)
      
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message,
        })
        
        setInstanceInfo({
          hasInstance: false,
          status: "disconnected"
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al eliminar la instancia",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-500"
      case "connecting": return "bg-yellow-500"
      case "disconnected": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected": return "Conectado"
      case "connecting": return "Conectando"
      case "disconnected": return "Desconectado"
      default: return "Desconocido"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return <Wifi className="h-4 w-4" />
      case "connecting": return <Loader2 className="h-4 w-4 animate-spin" />
      case "disconnected": return <WifiOff className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">WhatsApp</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getStatusColor(instanceInfo.status)} text-white`}>
                {getStatusIcon(instanceInfo.status)}
                <span className="ml-1">{getStatusText(instanceInfo.status)}</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshInstanceInfo}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <CardDescription>
            Instancia de WhatsApp para {sucursalName}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!instanceInfo.hasInstance ? (
            <div className="text-center py-6">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-4">
                No hay instancia de WhatsApp configurada para esta sucursal
              </p>
              <Button 
                onClick={createInstance} 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Crear Instancia
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm">
                <strong>Instancia:</strong> {instanceInfo.instanceName || "N/A"}
              </div>
              
              {instanceInfo.lastConnection && (
                <div className="text-sm text-gray-600">
                  <strong>Última conexión:</strong> {new Date(instanceInfo.lastConnection).toLocaleString()}
                </div>
              )}

              <div className="flex gap-2">
                {instanceInfo.status === "disconnected" && (
                  <Button 
                    size="sm" 
                    onClick={handleConnect}
                    disabled={isGeneratingQR}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGeneratingQR ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Qr className="mr-2 h-4 w-4" />
                    )}
                    Conectar
                  </Button>
                )}
                
                {instanceInfo.status === "connecting" && (
                  <Button 
                    size="sm" 
                    onClick={handleConnect}
                    disabled={isGeneratingQR}
                    variant="outline"
                  >
                    {isGeneratingQR ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Qr className="mr-2 h-4 w-4" />
                    )}
                    Mostrar QR
                  </Button>
                )}

                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Código QR de WhatsApp</DialogTitle>
            <DialogDescription>
              Escanea este código QR con WhatsApp para conectar la instancia de {sucursalName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-6">
            {isGeneratingQR ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">Generando código QR...</p>
              </div>
            ) : qrCode ? (
              <img 
                src={qrCode} 
                alt="QR Code" 
                className="w-64 h-64 border rounded-lg" 
              />
            ) : (
              <div className="w-64 h-64 border rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-500">No se pudo generar el QR</p>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>1. Abre WhatsApp en tu teléfono</p>
            <p>2. Ve a Configuración → Dispositivos vinculados</p>
            <p>3. Toca "Vincular un dispositivo"</p>
            <p>4. Escanea este código QR</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}