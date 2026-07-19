import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { apiClient } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Calendar, MapPin, Mail, Phone, Award } from 'lucide-react';

interface CandidateDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experienceYears: number;
  currentCompany: string;
  applications: any[];
  resumes: any[];
}

interface RecommendedJob {
  job: { id: string, title: string, department: string };
  score: number;
}

export const CandidateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candRes, recRes] = await Promise.all([
          apiClient.get(`/candidates/${id}`),
          apiClient.get(`/candidates/${id}/recommended-jobs`)
        ]);
        setCandidate(candRes.data.data);
        setRecommendations(recRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="animate-fade-in text-gradient" style={{ fontSize: '20px' }}>Loading Profile...</div>;
  if (!candidate) return <div>Candidate not found</div>;

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/candidates')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', fontSize: '14px' }}>
        <ArrowLeft size={16} /> Back to Talent Pool
      </button>

      <div style={{ display: 'flex', gap: '32px' }}>
        {/* Left Column - Profile Info */}
        <div style={{ flex: '0 0 350px' }}>
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ marginBottom: '4px', color: 'var(--text-primary)' }}>{candidate.name}</h2>
            <div style={{ color: 'var(--accent-primary)', fontWeight: 500, marginBottom: '16px' }}>
              {candidate.currentCompany ? `${candidate.currentCompany} • ` : ''}
              {candidate.experienceYears ? `${candidate.experienceYears} Years Exp` : 'Exp not specified'}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} /> {candidate.email}</div>
              {candidate.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} /> {candidate.phone}</div>}
              {candidate.location && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> {candidate.location}</div>}
            </div>
            
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px' }}>Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {candidate.skills.map(skill => (
                  <span key={skill} className="badge badge-indigo">{skill}</span>
                ))}
              </div>
            </div>

            {candidate.resumes && candidate.resumes.length > 0 && (() => {
              const parsed = candidate.resumes[0].parsedData;
              const achievements = parsed && parsed.achievements ? parsed.achievements : [];
              if (achievements.length === 0) return null;
              return (
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award size={16} color="var(--accent-amber)" /> Standout Achievements
                  </h4>
                  <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {achievements.map((ach: string, i: number) => <li key={i}>{ach}</li>)}
                  </ul>
                </div>
              );
            })()}
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="var(--accent-amber)" /> AI Future Role Recommendations
            </h4>
            {recommendations.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No current jobs match this candidate.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recommendations.map(rec => (
                  <div key={rec.job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{rec.job.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rec.job.department}</div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: 'var(--accent-emerald)', fontSize: '14px' }}>{rec.score}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Timeline */}
        <div style={{ flex: 1 }}>
          <h3 className="text-gradient" style={{ marginBottom: '24px' }}>Candidate Timeline</h3>
          
          <div className="glass-card">
            {candidate.applications.length === 0 ? (
              <div style={{ color: 'var(--text-muted)' }}>No timeline activity found.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderLeft: '2px solid var(--glass-border)', paddingLeft: '24px', marginLeft: '12px' }}>
                {candidate.applications.map(app => (
                  <div key={app.id} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-33px', top: '0', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-primary)', border: '4px solid var(--bg-secondary)' }} />
                    <div className="glass-panel" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            Applied for {app.job.title} {app.resume?.version ? <span style={{fontSize: '12px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px'}}>Resume v{app.resume.version}</span> : null}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(app.appliedAt).toLocaleDateString()}</div>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>
                      
                      {app.interviews && app.interviews.length > 0 && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--glass-border)' }}>
                          <h5 style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Interviews</h5>
                          {app.interviews.map((iv: any) => (
                            <div key={iv.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 500 }}><Calendar size={12} style={{ display: 'inline', marginRight: '4px' }}/> {new Date(iv.scheduledAt).toLocaleString()}</div>
                                <StatusBadge status={iv.status} />
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Interviewer: {iv.interviewerName}</div>
                              {iv.feedbackText && (
                                <div style={{ marginTop: '8px', fontSize: '13px', borderLeft: '2px solid var(--accent-emerald)', paddingLeft: '8px' }}>
                                  <strong>Feedback:</strong> {iv.feedbackText}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
