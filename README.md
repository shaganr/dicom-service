# DICOM Processing Service

## Getting Started

Install the dependencies and run the server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Routes

```
POST Upload: http://localhost:3000/api/dicom/upload
GET View: http://localhost:3000/api/dicom/[fileId]/png
GET Attribute http://localhost:3000/api/dicom/[fileId]/[tag] (Please remove the comma from the tag i.e 0002,0000 -> 00020000)
```

