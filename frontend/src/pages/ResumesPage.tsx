import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { apiClient } from '../api/client';

export const ResumesPage = () => {
  const [jobs, setJobs] = useState<{ id: string, title: string }[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get('/jobs').then(res => setJobs(res.data.data)).catch(console.error);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!selectedJob || files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('jobId', selectedJob);
    files.forEach(file => formData.append('files', file));

    try {
      // Explicitly delete Content-Type so Axios/browser sets the correct
      // multipart/form-data with the boundary. Without this, our default
      // application/json header breaks Multer's multipart parsing.
      const res = await apiClient.post('/resumes/upload', formData, {
        headers: { 'Content-Type': undefined },
      });
      setResults(res.data.data.processed);
      setFiles([]);
    } catch (err: any) {
      console.error('Upload error:', err?.response?.data ?? err);
      alert(`Upload failed: ${err?.response?.data?.error?.message ?? 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-gradient" style={{ marginBottom: '24px' }}>Resume Processing Dashboard</h1>

      <div style={{ display: 'flex', gap: '32px' }}>
        <div style={{ flex: 1 }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '24px' }}>Upload Resumes (PDF)</h3>
            
            <div className="input-group">
              <label>Select Target Job</label>
              <select className="input-field" value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
                <option value="">-- Choose Job --</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>

            <div 
              style={{
                border: '2px dashed var(--glass-border)',
                borderRadius: '12px',
                padding: '48px 24px',
                textAlign: 'center',
                background: 'rgba(0,0,0,0.2)',
                marginBottom: '24px',
                marginTop: '16px',
                position: 'relative'
              }}
            >
              <input 
                type="file" 
                multiple 
                accept="application/pdf"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <UploadCloud size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Drag & drop PDFs here</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>or click to browse files</div>
            </div>

            {files.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Selected Files ({files.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {files.map(file => (
                    <div key={file.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '13px' }}>
                      <FileText size={14} color="var(--accent-emerald)" />
                      {file.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={!selectedJob || files.length === 0 || uploading}
              onClick={handleUpload}
            >
              {uploading ? <><Loader size={16} className="animate-spin" /> Processing with AI...</> : 'Process Resumes'}
            </button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="glass-card" style={{ minHeight: '100%' }}>
            <h3 style={{ marginBottom: '24px' }}>Processing Results</h3>
            {results.length === 0 && !uploading && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '64px' }}>
                Upload resumes to see the AI processing results.
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.map((res, i) => (
                <div key={i} className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {res.status === 'success' ? (
                    <CheckCircle color="var(--accent-emerald)" size={24} />
                  ) : (
                    <AlertCircle color="var(--accent-rose)" size={24} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{res.filename}</div>
                    <div style={{ fontSize: '12px', color: res.status === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)', marginTop: '4px' }}>
                      {res.status === 'success' ? `Successfully parsed as ${res.candidateName}` : res.error}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
