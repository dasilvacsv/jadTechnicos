'use client'

import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Loader2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import ServiceOrderPDF from './service-order-pdf'; // Componente para la vista previa en HTML
import { DownloadDeliveryNoteButton } from './service-order/DownloadDeliveryNoteButton';
import { DownloadServiceOrderButton } from './service-order/DownloadServiceOrderButton';
import { CurrencyConverter } from '@/components/currency-converter';
import { toast } from "@/hooks/use-toast";
import { sendWhatsappMessageWithPDF } from '@/features/whatsapp/actions';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { pdf } from '@react-pdf/renderer';
import { ServiceOrderPDF as PDFServiceOrder } from './service-order/ServiceOrderPDF'; // Componente para generar Blob de PDF
import { DeliveryNotePDF } from './service-order/DeliveryNotePDF'; // Componente para generar Blob de PDF
import { getBCVRates } from '@/lib/exchangeRates';

interface PrintServiceOrderProps {
  order: any;
}

export function PrintServiceOrder({ order }: PrintServiceOrderProps) {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'service' | 'delivery'>('service');
  const [isPresupuesto, setIsPresupuesto] = useState(false);
  const [useEuro, setUseEuro] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [bcvRates, setBcvRates] = useState<{ usd: number; eur: number } | null>(null);
  const [showBcvConversion, setShowBcvConversion] = useState(true);
  const serviceNoteRef = useRef<HTMLDivElement>(null);
  const deliveryNoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBCVRates = async () => {
      try {
        const rates = await getBCVRates();
        setBcvRates({
          usd: rates.usd.rate,
          eur: rates.eur.rate
        });
      } catch (error) {
        console.error('Error loading BCV rates:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las tasas BCV",
          variant: "destructive"
        });
      }
    };
    loadBCVRates();
  }, []);

  const handlePrintServiceNote = useReactToPrint({
    content: () => serviceNoteRef.current,
    documentTitle: `Orden-Servicio-${order.orderNumber}`,
  });

  const handlePrintDeliveryNote = useReactToPrint({
    content: () => deliveryNoteRef.current,
    documentTitle: isPresupuesto
      ? `Presupuesto-${order.orderNumber}`
      : `Nota-Entrega-${order.orderNumber}`,
  });

  const sucursalId = order.client?.sucursalId;
  const bossPhone = "+584121924476";
  const clientPhone = order.client?.phone;

  const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith('58')) {
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      cleaned = '58' + cleaned;
    }
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    return cleaned;
  };

  const formattedClientPhone = formatPhoneNumber(clientPhone);
  const formattedBossPhone = formatPhoneNumber(bossPhone);

  // Decidir qué tasa pasar al componente hijo
  const selectedBcvRate = useEuro ? bcvRates?.eur : bcvRates?.usd;

  const sendServiceOrderViaWhatsApp = async (phone: string) => {
    if (!selectedBcvRate) {
        toast({ title: "Error", description: "Las tasas BCV no están cargadas.", variant: "destructive" });
        return;
    }
    try {
      setIsSending(true);
      
      const pdfDoc = <PDFServiceOrder 
        order={order} 
        useEuro={useEuro} 
        showBcvConversion={showBcvConversion} 
        bcvRate={selectedBcvRate}
      />;
      const pdfBlob = await pdf(pdfDoc).toBlob();
      
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });
      
      const currencyInfo = showBcvConversion && bcvRates
        ? `\n💱 Tasa BCV: 1 ${useEuro ? 'EUR' : 'USD'} = ${selectedBcvRate} Bs`
        : '';
      
      const message = `🔧 *ORDEN DE SERVICIO #${order.orderNumber}* 🔧\n\n` +
        `Le enviamos los detalles de la orden de servicio adjuntos en este PDF.${currencyInfo}`;
      
      const result = await sendWhatsappMessageWithPDF(
        phone, 
        message, 
        base64Data,
        `Orden-Servicio-${order.orderNumber}.pdf`,
        sucursalId
      );
      
      if (result.success) {
        toast({ title: "Éxito", description: "Orden de servicio enviada correctamente" });
      } else {
        throw new Error(result.error || "Error desconocido al enviar PDF");
      }
    } catch (error) {
      console.error('Error sending service order:', error);
      toast({
        title: "Error",
        description: "Error al enviar el documento: " + (error instanceof Error ? error.message : 'Desconocido'),
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendDeliveryNoteViaWhatsApp = async (phone: string) => {
    if (!selectedBcvRate) {
        toast({ title: "Error", description: "Las tasas BCV no están cargadas.", variant: "destructive" });
        return;
    }
    try {
      setIsSending(true);

      const pdfDoc = <DeliveryNotePDF 
        order={order} 
        deliveryNote={order.deliveryNotes?.[0]}
        isPresupuesto={isPresupuesto}
        useEuro={useEuro}
        showBcvConversion={showBcvConversion}
        bcvRate={selectedBcvRate}
      />;
      const pdfBlob = await pdf(pdfDoc).toBlob();
      
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });
      
      const docType = isPresupuesto ? "PRESUPUESTO" : "NOTA DE ENTREGA";
      const currencyInfo = showBcvConversion && bcvRates
        ? `\n💱 Tasa BCV: 1 ${useEuro ? 'EUR' : 'USD'} = ${selectedBcvRate} Bs`
        : '';
        
      const message = `📋 *${docType} - ORDEN #${order.orderNumber}* 📋\n\n` +
        `Le enviamos los detalles ${isPresupuesto ? "del presupuesto" : "de la entrega"} adjuntos en este PDF.${currencyInfo}`;
      
      const result = await sendWhatsappMessageWithPDF(
        phone, 
        message, 
        base64Data,
        isPresupuesto ? `Presupuesto-${order.orderNumber}.pdf` : `Nota-Entrega-${order.orderNumber}.pdf`,
        sucursalId
      );
      
      if (result.success) {
        toast({ title: "Éxito", description: `${docType} enviado correctamente` });
      } else {
        throw new Error(result.error || "Error desconocido al enviar PDF");
      }
    } catch (error) {
      console.error('Error sending delivery note:', error);
      toast({
        title: "Error",
        description: "Error al enviar el documento: " + (error instanceof Error ? error.message : 'Desconocido'),
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const getDisplayAmount = () => {
    if (order.presupuestoAmount && Number(order.presupuestoAmount) > 0) {
      return Number(order.presupuestoAmount);
    }
    if (activeView === 'delivery' && order.deliveryNotes?.[0]?.amount) {
      return Number(order.deliveryNotes[0].amount);
    }
    return 0;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl bg-background">
      <div className="flex justify-between mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Volver</span>
        </Button>
        <div className="flex gap-2">
          <Button
            className={`${activeView === 'service'
              ? 'bg-blue-600 text-white font-semibold shadow-md'
              : 'bg-blue-200 text-blue-800 hover:bg-blue-300'}`}
            onClick={() => setActiveView('service')}
          >
            {activeView === 'service'
              ? '📝 ORDEN DE SERVICIO ✓'
              : '📝 Ver Orden de Servicio'}
          </Button>
          <Button
            className={`${activeView === 'delivery'
              ? 'bg-purple-600 text-white font-semibold shadow-md'
              : 'bg-purple-200 text-purple-800 hover:bg-purple-300'}`}
            onClick={() => setActiveView('delivery')}
          >
            📋 PRESUPUESTO / NOTA DE ENTREGA {activeView === 'delivery' ? '✓' : ''}
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-4 mb-4 items-start">
        <div className="flex flex-col gap-4">
          <CurrencyConverter
            useEuro={useEuro}
            onCurrencyChange={setUseEuro}
            amount={getDisplayAmount()}
            showConversion={showBcvConversion}
          />
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Mostrar conversión BCV</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showBcvConversion}
                onChange={(e) => setShowBcvConversion(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        {activeView === 'delivery' && (
          <div className="flex items-center gap-2 mr-4">
            <label className="text-sm font-medium">Modo Presupuesto</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPresupuesto}
                onChange={(e) => setIsPresupuesto(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        )}
        
        {activeView === 'service' ? (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSending}
                >
                  {isSending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="mr-2 h-4 w-4" />
                  )}
                  Enviar Orden
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-none"
                    onClick={() => sendServiceOrderViaWhatsApp(formattedBossPhone)}
                    disabled={isSending}
                  >
                    Enviar al Jefe
                  </Button>
                  {formattedClientPhone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start rounded-none"
                      onClick={() => sendServiceOrderViaWhatsApp(formattedClientPhone)}
                      disabled={isSending}
                    >
                      Enviar al Cliente
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <DownloadServiceOrderButton 
              order={order} 
              useEuro={useEuro} 
              showBcvConversion={showBcvConversion}
              bcvRate={selectedBcvRate} // PASAR LA TASA REAL
            />
            <Button 
              onClick={handlePrintServiceNote}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Imprimir Orden de Servicio
            </Button>
          </>
        ) : (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isSending}
                >
                  {isSending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="mr-2 h-4 w-4" />
                  )}
                  Enviar {isPresupuesto ? 'Presupuesto' : 'Nota de Entrega'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-none"
                    onClick={() => sendDeliveryNoteViaWhatsApp(formattedBossPhone)}
                    disabled={isSending}
                  >
                    Enviar al Jefe
                  </Button>
                  {formattedClientPhone && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start rounded-none"
                      onClick={() => sendDeliveryNoteViaWhatsApp(formattedClientPhone)}
                      disabled={isSending}
                    >
                      Enviar al Cliente
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <DownloadDeliveryNoteButton 
              order={order} 
              deliveryNote={order.deliveryNotes?.[0]} 
              isPresupuesto={isPresupuesto}
              useEuro={useEuro}
              showBcvConversion={showBcvConversion}
              bcvRate={selectedBcvRate} // PASAR LA TASA REAL
            />
            <Button 
              onClick={handlePrintDeliveryNote}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Imprimir {isPresupuesto ? 'Presupuesto' : 'Nota de Entrega'}
            </Button>
          </>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden shadow-lg">
        {activeView === 'service' && (
          <div ref={serviceNoteRef}>
            <ServiceOrderPDF 
              order={order} 
              useEuro={useEuro} 
              showBcvConversion={showBcvConversion}
              bcvRate={selectedBcvRate}
            />
          </div>
        )}
        
        {activeView === 'delivery' && (
          <div ref={deliveryNoteRef}>
            <ServiceOrderPDF 
              order={order} 
              isDeliveryNote 
              deliveryNote={order.deliveryNotes?.[0]} 
              isPresupuesto={isPresupuesto}
              useEuro={useEuro}
              showBcvConversion={showBcvConversion}
              bcvRate={selectedBcvRate}
            />
          </div>
        )}
      </div>

      {/* Divs ocultos para que useReactToPrint pueda generar la impresión */}
      <div className="hidden">
        <div ref={serviceNoteRef}>
          <ServiceOrderPDF 
            order={order} 
            useEuro={useEuro}
            showBcvConversion={showBcvConversion}
            bcvRate={selectedBcvRate}
          />
        </div>
        <div ref={deliveryNoteRef}>
          <ServiceOrderPDF 
            order={order} 
            isDeliveryNote 
            deliveryNote={order.deliveryNotes?.[0]} 
            isPresupuesto={isPresupuesto}
            useEuro={useEuro}
            showBcvConversion={showBcvConversion}
            bcvRate={selectedBcvRate}
          />
        </div>
      </div>
    </div>
  );
}