import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Users, Mail, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Candidate {
  id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
  experienceYears: number;
  currentCompany: string;
  _count: { applications: number };
}

export const CandidatesPage = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await apiClient.get('/candidates');
        setCandidates(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const filtered = candidates.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="text-gradient" style={{ margin: 0 }}>Talent Pool</h1>
        <div style={{ flex: '1 1 250px', maxWidth: '400px' }}>
          <input 
            type="text" 
            placeholder="Search candidates or skills..." 
            className="input-field" 
            style={{ width: '100%' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Experience</th>
              <th>Skills</th>
              <th>Applications</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center' }}>No candidates found in talent pool.</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/candidates/${c.id}`)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={16} color="var(--accent-primary)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                          <span><Mail size={10} style={{ display: 'inline', marginRight: '2px' }} /> {c.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      {c.experienceYears ? `${c.experienceYears} Years` : 'Not specified'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {c.currentCompany || ''}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                      {c.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="badge badge-indigo" style={{ fontSize: '10px' }}>{skill}</span>
                      ))}
                      {c.skills.length > 3 && <span className="badge" style={{ background: 'var(--glass-border)', fontSize: '10px' }}>+{c.skills.length - 3}</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c._count.applications}</span>
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
