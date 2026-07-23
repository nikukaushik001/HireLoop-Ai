import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, Briefcase, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Job {
  id: string;
  title: string;
  department: string;
  description?: string;
  requirements?: string;
  status: string;
  _count: { applications: number };
  createdAt: string;
}

export const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Job Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await apiClient.get('/jobs');
      setJobs(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDepartment('');
    setDescription('');
    setRequirements('');
    setEditingJobId(null);
    setShowForm(false);
    setError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    setTitle(job.title);
    setDepartment(job.department || '');
    // Fetch full job details to get description and requirements if they aren't in the list view
    // For simplicity, assuming they might not be fully present, we fetch it
    apiClient.get(`/jobs/${job.id}`).then(res => {
      const fullJob = res.data.data;
      setDescription(fullJob.description || '');
      setRequirements(fullJob.requirements || '');
    }).catch(console.error);

    setEditingJobId(job.id);
    setShowForm(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setError(null);
    if (window.confirm('Are you sure you want to delete this job? This will delete all associated applications.')) {
      try {
        await apiClient.delete(`/jobs/${id}`);
        fetchJobs();
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.error?.message || 'Failed to delete job');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingJobId) {
        await apiClient.patch(`/jobs/${editingJobId}`, { title, department, description, requirements });
      } else {
        await apiClient.post('/jobs', { title, department, description, requirements });
      }
      resetForm();
      fetchJobs();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error?.message || 'Failed to save job');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="text-gradient" style={{ margin: 0 }}>Jobs</h1>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Create Job
        </button>
      </div>

      {error && (
        <div className="animate-fade-in" style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-danger)', color: 'var(--accent-danger)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>{editingJobId ? 'Edit Job' : 'Create New Job'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Job Title</label>
                <input 
                  required 
                  pattern="^[A-Za-z\s]+$" 
                  title="Only alphabetical characters and spaces allowed"
                  className="input-field" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Only alphabets and spaces allowed.</small>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Department</label>
                <input 
                  pattern="^[A-Za-z\s]*$"
                  title="Only alphabetical characters and spaces allowed"
                  className="input-field" 
                  value={department} 
                  onChange={e => setDepartment(e.target.value)} 
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Only alphabets and spaces allowed.</small>
              </div>
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea 
                required 
                minLength={10}
                className="input-field" 
                rows={3} 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Minimum 10 characters required.</small>
            </div>
            <div className="input-group">
              <label>Requirements</label>
              <textarea className="input-field" rows={3} value={requirements} onChange={e => setRequirements(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!title.trim() || description.trim().length < 10}
                style={{ 
                  opacity: (!title.trim() || description.trim().length < 10) ? 0.5 : 1, 
                  cursor: (!title.trim() || description.trim().length < 10) ? 'not-allowed' : 'pointer' 
                }}
              >
                {editingJobId ? 'Update Job' : 'Save Job'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Department</th>
              <th>Status</th>
              <th>Applications</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center' }}>No jobs found</td></tr>
            ) : (
              jobs.map(job => (
                <tr key={job.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job.id}`)}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={16} color="var(--accent-primary)" />
                      {job.title}
                    </div>
                  </td>
                  <td>{job.department || '-'}</td>
                  <td><StatusBadge status={job.status} /></td>
                  <td>
                    <span style={{ color: job._count.applications > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {job._count.applications}
                    </span>
                  </td>
                  <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={(e) => handleOpenEdit(e, job)}
                        className="btn btn-secondary" 
                        style={{ padding: '6px', borderRadius: '8px' }}
                        title="Edit Job"
                      >
                        <Edit2 size={14} color="var(--accent-primary)" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, job.id)}
                        className="btn btn-danger" 
                        style={{ padding: '6px', borderRadius: '8px' }}
                        title="Delete Job"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};
