import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router';
import { apiClient } from '../api/client';

export const ResumesPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<{ id: string, title: string }[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      // Explicitly delete Content-Type so Axios/browser sets the correct
      // multipart/form-data with the boundary. Without this, our default
      // application/json header breaks Multer's multipart parsing.
      const res = await apiClient.post('/resumes/upload', formData, {
        headers: { 'Content-Type': undefined },
      });
      
      const processed = res.data?.data?.processed || [];
      const failed = processed.filter((p: any) => p.status === 'failed');
      
      if (failed.length > 0) {
        // If some or all failed, show the exact error from the backend/AI
        setError(`Upload failed for ${failed.length} file(s). Reason: ${failed[0].error}`);
      } else {
        setShowSuccess(true);
      }
      setFiles([]);
    } catch (err: any) {
      console.error('Upload error:', err?.response?.data ?? err);
      setError(`Upload failed: ${err?.response?.data?.error?.message ?? 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  if (showSuccess) {
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
        <div className="glass-card" style={{ textAlign: 'center', padding: '64px', maxWidth: '500px', position: 'relative', overflow: 'hidden' }}>
          {/* Animated background glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '200px', height: '200px', background: 'var(--accent-emerald)', 
            filter: 'blur(80px)', opacity: 0.15, zIndex: 0
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px auto', border: '2px solid var(--accent-emerald)',
              animation: 'scaleInGlow 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
            }}>
              <CheckCircle size={40} color="var(--accent-emerald)" />
            </div>
            
            <h2 style={{ 
              fontSize: '32px', marginBottom: '16px', fontWeight: 'bold',
              background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', 
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'slideUpFade 0.5s ease-out 0.2s both'
            }}>
              Processing Complete!
            </h2>
            
            <p style={{ 
              color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '32px', lineHeight: '1.6',
              animation: 'slideUpFade 0.5s ease-out 0.3s both'
            }}>
              The AI has successfully parsed your resumes. The new candidates have been automatically added to your talent pool.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', animation: 'slideUpFade 0.5s ease-out 0.4s both' }}>
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

  return (
    <div className="animate-fade-in">
      <h1 className="text-gradient" style={{ marginBottom: '24px' }}>Resume Processing Dashboard</h1>

      {error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', maxWidth: '600px', margin: '0 auto 24px auto' }}>
          {error}
        </div>
      )}

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
