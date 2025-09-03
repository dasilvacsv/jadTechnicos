
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logoDirectory = path.join(process.cwd(), 'public', 'logos');
    
    // Check if directory exists
    if (!fs.existsSync(logoDirectory)) {
      return NextResponse.json(
        { success: false, error: 'Logos directory not found' },
        { status: 404 }
      );
    }
    
    // Read directory contents
    const files = fs.readdirSync(logoDirectory);
    
    // Filter for image files
    const imageFiles = files.filter(file => {
      const extension = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(extension);
    });
    
    // Create logo objects with paths and names
    const logos = imageFiles.map(file => ({
      name: file,
      path: `/logos/${file}`,
      url: `/logos/${file}`
    }));
    
    return NextResponse.json({ success: true, data: logos });
  } catch (error) {
    console.error('Error fetching logos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch logos' },
      { status: 500 }
    );
  }
}