import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as dicomParser from 'dicom-parser';
import * as fastPng from 'fast-png';

export async function GET(
  _request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = await params;
    const filePath = join(process.cwd(), 'uploads', fileId);
    
    // Read the DICOM file
    const dicomBuffer = await readFile(filePath);
    const dataSet = dicomParser.parseDicom(dicomBuffer);
    
    /**
     * The code to covert DICOM to PNG has been copied from a variety of sources. I found it quite difficult to find a library that could convert DICOM to PNG in a single step. The code below is a simplified version of the process.
     */
    // Get the expected dimensions
    const pixelDataElement = dataSet.elements.x7fe00010;
    const width = dataSet.uint16('x00280011') || 1; // Columns
    const height = dataSet.uint16('x00280010') || 1; // Rows
  
    // Extract the pixel data as a typed array
    const pixelData = new Uint16Array(
      dicomBuffer.buffer,
      pixelDataElement.dataOffset,
      pixelDataElement.length / 2 // 16-bit depth
    );

    // Handle rescaling based on DICOM metadata (Rescale Slope and Intercept)
    const rescaleIntercept = dataSet.floatString('x00281052') || 0;
    const rescaleSlope = dataSet.floatString('x00281053') || 1;
    const scaledPixelData = pixelData.map(
      (value) => value * rescaleSlope + rescaleIntercept
    );

    // Apply windowing (contrast adjustment)
    const windowCenter = dataSet.floatString('x00281050') || 128;
    const windowWidth = dataSet.floatString('x00281051') || 256;

    const minPixelValue = windowCenter - windowWidth / 2;
    const maxPixelValue = windowCenter + windowWidth / 2;

    const windowedPixelData = scaledPixelData.map((value) => {
      let windowedValue = ((value - minPixelValue) / (maxPixelValue - minPixelValue)) * 255;
      windowedValue = Math.min(Math.max(windowedValue, 0), 255);
      return Math.round(windowedValue);
    });

    // End copied code

    // Convert windowed pixel data to a PNG buffer
    const pngBuffer = fastPng.encode({
      width,
      height,
      data: new Uint16Array(windowedPixelData),
      channels: 1
    });

    return new NextResponse(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('PNG conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert DICOM to PNG' },
      { status: 500 }
    );
  }
}
