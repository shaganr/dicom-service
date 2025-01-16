import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import * as dicomParser from 'dicom-parser';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

export async function POST(request: Request) {
  try {
    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No DICOM file provided' },
        { status: 400 }
      );
    }

    // Generates a unique file ID based on the date but to ensure there are no collisions, a UUID would be more appropriate 
    const fileId = `${Date.now()}-${file.name}`;
    const filePath = join(UPLOAD_DIR, fileId);

    // Convert File to Buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse DICOM to validate
    dicomParser.parseDicom(buffer);

    // Save file
    await writeFile(filePath, buffer);

    return NextResponse.json({
      fileId,
      message: 'DICOM file uploaded successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process DICOM file' },
      { status: 500 }
    );
  }
}
