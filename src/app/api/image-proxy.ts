import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  
  if (!url) return res.status(400).json({ error: 'URL requerida' });
  
  try {
    const imageResponse = await fetch(url as string);
    
    if (!imageResponse.ok) throw new Error('Error al obtener imagen');
    
    // Pipe de la respuesta de la imagen al cliente
    res.setHeader('Content-Type', imageResponse.headers.get('Content-Type') || 'image/*');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    return imageResponse.body.pipe(res);
  } catch (error) {
    return res.status(500).json({ error: 'Error al procesar la imagen' });
  }
}