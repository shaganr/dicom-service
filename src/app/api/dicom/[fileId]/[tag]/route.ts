import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as dicomParser from 'dicom-parser';

export async function GET(
  _request: Request,
  { params }: { params: { fileId: string; tag: string } }
) {
  try {
    const { fileId, tag: _tag } = await params;
    const tag = `x${_tag}`;
    const filePath = join(process.cwd(), 'uploads', fileId);

    const fileBuffer = await readFile(filePath);
    const dataSet = dicomParser.parseDicom(fileBuffer);
    const attribute = dataSet.elements[tag].vr

    if (!attribute) {
      return NextResponse.json(
        { error: 'Tag not found in DICOM file' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tag, attribute });
  } catch (error) {
    console.error('Attribute retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve DICOM attribute' },
      { status: 500 }
    );
  }
}
