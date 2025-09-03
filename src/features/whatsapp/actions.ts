'use server'

import { z } from 'zod'
import { getSucursalInstanceName } from '@/features/sucursales/whatsapp-instance-actions'

const sendMessageSchema = z.object({
  phoneNumber: z.string().min(8),
  text: z.string().min(1),
})

const sendMessageWithQRSchema = z.object({
  phoneNumber: z.string().min(8),
  text: z.string().min(1),
  image: z.string().min(1),
});

const sendMessageWithPDFSchema = z.object({
  phoneNumber: z.string().min(8),
  text: z.string().min(1),
  pdfBase64: z.string().min(1),
  fileName: z.string().min(1),
});

type SendMessageResponse = {
  success: boolean
  error?: string
  data?: any
}

// Helper function to send message using specific instance
async function sendMessageWithInstance(
  instanceName: string,
  phoneNumber: string, 
  text: string,
  messageType: 'text' | 'media' | 'document' = 'text',
  mediaData?: string,
  fileName?: string
): Promise<SendMessageResponse> {
  try {
    const cleanPhone = phoneNumber.replace(/\D/g, '')
    
    const API_BASE_URL = process.env.EVOLUTION_API_URL
    const API_KEY = process.env.EVOLUTION_API_KEY

    if (!API_BASE_URL || !API_KEY) {
      throw new Error('Missing Evolution API configuration')
    }

    let endpoint = ''
    let body: any = {}

    switch (messageType) {
      case 'text':
        endpoint = `${API_BASE_URL}/message/sendText/${instanceName}`
        body = {
          number: cleanPhone,
          text: text,
          delay: 450,
          linkPreview: true,
        }
        break
      case 'media':
        endpoint = `${API_BASE_URL}/message/sendMedia/${instanceName}`
        body = {
          number: cleanPhone,
          mediatype: "image",
          mimetype: "image/png",
          media: mediaData,
          caption: text,
          fileName: fileName || `image-${Date.now()}.png`,
          delay: 450,
        }
        break
      case 'document':
        endpoint = `${API_BASE_URL}/message/sendMedia/${instanceName}`
        body = {
          number: cleanPhone,
          mediatype: "document",
          mimetype: "application/pdf",
          media: mediaData,
          caption: text,
          fileName: fileName || `document-${Date.now()}.pdf`,
          delay: 450,
        }
        break
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'apikey': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send message')
    }

    const data = await response.json()
    return { success: true, data }

  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    }
  }
}

export async function sendWhatsappMessage(
  phoneNumber: string,
  text: string
): Promise<SendMessageResponse> {
  try {
    // Check if messaging is enabled in environment variables
    const messagesEnabled = process.env.MESSAGES_ENABLED === 'true';
    if (!messagesEnabled) {
      console.log('WhatsApp messages are disabled by environment setting');
      return { success: true, data: { skipped: true, reason: 'Messages disabled by environment setting' } };
    }
    
    const validated = sendMessageSchema.parse({ phoneNumber, text })
    
    const instanceName = process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE || 'multiservicejad-4053'

    return await sendMessageWithInstance(instanceName, validated.phoneNumber, validated.text, 'text')

  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    }
  }
}

// 🎉 FUNCIÓN MODIFICADA 🎉
export async function sendWhatsappMessageWithQR(
  phoneNumber: string,
  text: string,
  image: string
): Promise<SendMessageResponse> {
  try {
    // ELIMINADO: La verificación de MESSAGES_ENABLED ya no está aquí
    
    const validated = sendMessageWithQRSchema.parse({ 
      phoneNumber, 
      text, 
      image
    });
    
    // Remove the data URL prefix if present
    const base64Image = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    
    const instanceName = process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE || 'multiservicejad-4053'

    return await sendMessageWithInstance(
      instanceName, 
      validated.phoneNumber, 
      validated.text, 
      'media', 
      base64Image,
      `order-${Date.now()}.png`
    )

  } catch (error) {
    console.error('Error sending WhatsApp message with QR:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message with QR',
    }
  }
}

export async function sendWhatsappMessageWithPDF(
  phoneNumber: string,
  text: string,
  pdfBase64: string,
  fileName: string,
  sucursalId?: string
): Promise<SendMessageResponse> {
  try {
    // --- VERIFICACIÓN DE MESSAGES_ENABLED ELIMINADA ---

    const validated = sendMessageWithPDFSchema.parse({
      phoneNumber,
      text,
      pdfBase64,
      fileName,
    });
    
    const base64Data = validated.pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    
    let instanceName = process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE || 'multiservicejad-4053'
    
    if (sucursalId) {
      const sucursalInstance = await getSucursalInstanceName(sucursalId)
      if (sucursalInstance) {
        instanceName = sucursalInstance
        console.log(`Using sucursal instance: ${instanceName} for sucursal: ${sucursalId}`)
      } else {
        console.log(`No connected instance found for sucursal ${sucursalId}, using default: ${instanceName}`)
      }
    }

    console.log(`Attempting to send PDF using instance: ${instanceName}`);
    
    return await sendMessageWithInstance(
      instanceName, 
      validated.phoneNumber,
      validated.text,
      'document', 
      base64Data,
      validated.fileName
    );

  } catch (error) {
    console.error('Error sending WhatsApp message with PDF:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Error de validación: ${error.errors.map(e => e.message).join(', ')}`,
      }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message with PDF',
    }
  }
}