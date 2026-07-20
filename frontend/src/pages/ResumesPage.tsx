import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { apiClient } from '../api/client';

export const ResumesPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<{ id: string, title: string }[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResults, setUploadResults] = useState<{ processed: any[], failed: any[] }>({ processed: [], failed: [] });
  const [selectedJob, setSelectedJob] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

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
    setError(null);
    const formData = new FormData();
    formData.append('jobId', selectedJob);
    files.forEach(file => formData.append('files', file));

    try {
      const res = await apiClient.post('/resumes/upload', formData, {
        headers: { 'Content-Type': undefined },
      });
      
      const processed = res.data?.data?.processed || [];
      const successful = processed.filter((p: any) => p.status === 'success');
      const failed = processed.filter((p: any) => p.status === 'failed');
      
      setUploadResults({ processed: successful, failed });
      setShowSuccess(true);
      setFiles([]);
    } catch (err: any) {
      console.error('Upload error:', err?.response?.data ?? err);
      setError(`Upload failed: ${err?.response?.data?.error?.message ?? 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  if (showSuccess) {
    const successCount = uploadResults.processed.length;
    const failedCount = uploadResults.failed.length;
    
    return (
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <style>{`
          @keyframes scaleInGlow {
            0% { transform: scale(0.8); opacity: 0; box-shadow: 0 0 0 rgba(16, 185, 129, 0); }
            50% { transform: scale(1.1); box-shadow: 0 0 40px rgba(16, 185, 129, 0.4); }
            100% { transform: scale(1); opacity: 1; box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
          }
          @keyframes slideUpFade {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
        <div className="glass-card" style={{ textAlign: 'center', padding: '64px', maxWidth: '600px', width: '100%', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              width: '80px', height: '80px', 
              background: successCount > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px auto', 
              border: `2px solid ${successCount > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
              animation: 'scaleInGlow 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
            }}>
              {successCount > 0 ? <CheckCircle size={40} color="var(--accent-emerald)" /> : <AlertCircle size={40} color="var(--accent-rose)" />}
            </div>
            
            <h2 style={{ 
              fontSize: '32px', marginBottom: '16px', fontWeight: 'bold',
              background: successCount > 0 ? 'linear-gradient(135deg, #34d399 0%, #059669 100%)' : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)', 
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'slideUpFade 0.5s ease-out 0.2s both'
            }}>
              {successCount > 0 ? 'Processing Complete!' : 'All Uploads Failed'}
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '24px', animation: 'slideUpFade 0.5s ease-out 0.3s both' }}>
              {successCount} resume{successCount !== 1 ? 's' : ''} successfully parsed and added to talent pool.
            </p>

            {failedCount > 0 && (
              <div style={{ 
                background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', 
                borderRadius: '12px', padding: '16px', marginBottom: '32px', textAlign: 'left',
                animation: 'slideUpFade 0.5s ease-out 0.4s both'
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} /> {failedCount} File{failedCount !== 1 ? 's' : ''} Rejected by AI Validation:
                </h3>
                <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {uploadResults.failed.map((f: any, idx: number) => {
                    const isFormatError = f.error?.toLowerCase().includes('valid resume') || f.error?.toLowerCase().includes('pdf');
                    return (
                      <div key={idx} style={{ fontSize: '13px', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px', color: '#cbd5e1' }}>
                        <strong style={{ color: '#f1f5f9' }}>{f.filename}</strong>
                        <div style={{ color: '#94a3b8', marginTop: '4px', fontSize: '12px' }}>
                          {isFormatError ? "Invalid document format (e.g., ticket, receipt, non-resume or broken PDF)." : f.error}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', animation: 'slideUpFade 0.5s ease-out 0.5s both' }}>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)' }} onClick={() => setShowSuccess(false)}>
                Upload More
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/candidates')} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                View Candidates
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isInvalidDoc = error.includes("valid resume") || error.includes("valid resume or CV");
    
    return (
      <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <style>{`
          @keyframes slideUpFade {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes pulseRed {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}</style>
        <div className="glass-card" style={{ 
          textAlign: 'center', padding: '56px', maxWidth: '540px', position: 'relative', 
          overflow: 'hidden', border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(239,68,68,0.05))'
        }}>
          <div style={{
            position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
            width: '200px', height: '200px', background: 'var(--accent-rose)', 
            filter: 'blur(100px)', opacity: 0.15, zIndex: 0
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px auto', border: '2px solid var(--accent-rose)',
              animation: 'pulseRed 2s infinite'
            }}>
              <AlertCircle size={40} color="var(--accent-rose)" />
            </div>
            
            <h2 style={{ 
              fontSize: '28px', marginBottom: '16px', fontWeight: 'bold',
              background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)', 
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'slideUpFade 0.5s ease-out 0.1s both'
            }}>
              {isInvalidDoc ? 'Invalid Document Detected' : 'Upload Failed'}
            </h2>
            
            <div style={{ 
              background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px',
              animation: 'slideUpFade 0.5s ease-out 0.2s both', textAlign: 'left'
            }}>
              <p style={{ color: '#f1f5f9', fontSize: '15px', margin: '0 0 12px 0', lineHeight: '1.6' }}>
                {isInvalidDoc 
                  ? "The AI Analysis Engine rejected this file because it does not appear to be a valid resume or CV." 
                  : "We encountered an error while processing your files."}
              </p>
              <div style={{ color: 'var(--accent-rose)', fontSize: '13px', fontFamily: 'monospace', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
                Error Code: {error}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', animation: 'slideUpFade 0.5s ease-out 0.3s both' }}>
              <button className="btn" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setError(null)}>
                Try Again with a valid PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-gradient" style={{ marginBottom: '24px' }}>Resume Processing Dashboard</h1>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
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
              {uploading ? <><Loader size={16} className="animate-spin" /> Uploading files...</> : 'Process Resumes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
