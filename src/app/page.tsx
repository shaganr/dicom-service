'use client';

import { useState } from 'react';

export default function Home() {
  const [fileId, setFileId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/dicom/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setFileId(data.fileId);
        setMessage('File uploaded successfully!');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">DICOM Processing Service</h1>
      
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block mb-2">Upload DICOM File:</label>
          <input
            type="file"
            name="file"
            className="border p-2 rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {message && (
        <div className="mt-4 p-4 rounded bg-gray-100">
          {message}
        </div>
      )}

      {fileId && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">File Actions:</h2>
          <div className="space-y-2">
            <p>File ID: {fileId}</p>
            <a
              href={`/api/dicom/${fileId}/png`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline block"
            >
              View as PNG
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
