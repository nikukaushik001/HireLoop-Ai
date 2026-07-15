import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Job {
  id: string;
  title: string;
  department: string;
  status: string;
  _count: { applications: number };
  createdAt: string;
}

export const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  // Create Job Form
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/jobs', { title, department, description, requirements });
      setShowCreate(false);
      fetchJobs(); // Refresh list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="text-gradient">Jobs</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Create Job
        </button>
      </div>

      {showCreate && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Create New Job</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Job Title</label>
                <input required className="input-field" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label>Department</label>
                <input className="input-field" value={department} onChange={e => setDepartment(e.target.value)} />
              </div>
            </div>
            <div className="input-group">
              <label>Description</label>
              <textarea required className="input-field" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Requirements</label>
              <textarea className="input-field" rows={3} value={requirements} onChange={e => setRequirements(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Job</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Department</th>
              <th>Status</th>
              <th>Applications</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>No jobs found</td></tr>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
