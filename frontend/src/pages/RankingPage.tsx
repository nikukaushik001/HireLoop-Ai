import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Trophy, Award, Medal, Star, ChevronDown, Briefcase, Brain, TrendingUp, Users, Loader, AlertCircle, CheckCircle, Target } from 'lucide-react';

interface RankedCandidate {
  applicationId: string;
  rank: number;
  candidate: {
    id: string;
    name: string;
    email: string;
    skills: string[];
    experienceYears?: number;
    location?: string;
  };
  aiScore: number;
  embeddingScore: number;
  bm25Score: number;
  achievements: string[];
  achievementBonus: number;
  finalScore: number;
  aiReasoning?: string;
  status: string;
}

interface RankingData {
  jobId: string;
  jobTitle: string;
  jobDepartment?: string;
  totalCandidates: number;
  rankedCandidates: RankedCandidate[];
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy size={22} style={{ color: '#FFD700' }} />;
  if (rank === 2) return <Award size={22} style={{ color: '#C0C0C0' }} />;
  if (rank === 3) return <Medal size={22} style={{ color: '#CD7F32' }} />;
  return <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-muted)', minWidth: '22px', textAlign: 'center' }}>#{rank}</span>;
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#6366f1';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Low';
};

const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 64 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontSize: size > 56 ? '16px' : '13px', fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>pts</span>
      </div>
    </div>
  );
};

const SkillBadge: React.FC<{ skill: string }> = ({ skill }) => (
  <span style={{
    padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 500,
    background: 'rgba(99,102,241,0.12)', color: 'var(--accent-primary)',
    border: '1px solid rgba(99,102,241,0.2)', whiteSpace: 'nowrap'
  }}>{skill}</span>
);

const CandidateCard: React.FC<{ item: RankedCandidate; isTop3: boolean }> = ({ item, isTop3 }) => {
  const [expanded, setExpanded] = useState(false);
  const topBorderColor = item.rank === 1 ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : item.rank === 3 ? '#CD7F32' : 'transparent';
  const scoreColor = getScoreColor(item.finalScore);

  return (
    <div
      style={{
        background: isTop3
          ? `linear-gradient(135deg, rgba(${item.rank === 1 ? '255,215,0' : item.rank === 2 ? '192,192,192' : '205,127,50'},0.04) 0%, rgba(10,12,24,0.9) 100%)`
          : 'rgba(15, 18, 35, 0.7)',
        border: `1px solid ${isTop3 ? topBorderColor + '44' : 'var(--glass-border)'}`,
        borderRadius: '16px',
        padding: '20px 24px',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        boxShadow: isTop3 ? `0 0 24px ${topBorderColor}11, 0 4px 20px rgba(0,0,0,0.3)` : '0 2px 12px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {isTop3 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: `linear-gradient(90deg, transparent, ${topBorderColor}, transparent)`
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Rank */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px' }}>
          {getRankIcon(item.rank)}
        </div>

        {/* Avatar */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
          background: `linear-gradient(135deg, ${scoreColor}33, ${scoreColor}11)`,
          border: `1px solid ${scoreColor}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', fontWeight: 700, color: scoreColor
        }}>
          {(item.candidate.name || 'C').charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
              {item.candidate.name || 'Unknown Candidate'}
            </span>
            <span style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
              background: `${scoreColor}22`, color: scoreColor,
              border: `1px solid ${scoreColor}44`, fontWeight: 600
            }}>
              {getScoreLabel(item.finalScore)}
            </span>
            {item.rank <= 3 && (
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
                background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)',
                border: '1px solid rgba(99,102,241,0.3)', fontWeight: 600
              }}>
                Top Pick
              </span>
            )}
            {item.achievementBonus > 0 && (
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '999px',
                background: 'rgba(234,179,8,0.15)', color: '#eab308',
                border: '1px solid rgba(234,179,8,0.3)', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <Trophy size={10} /> +{item.achievementBonus} Achiever Bonus
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{item.candidate.email}</div>

          {/* Skill chips (top 4) */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            {(item.candidate.skills || []).slice(0, 4).map(s => <SkillBadge key={s} skill={s} />)}
            {(item.candidate.skills || []).length > 4 && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '3px 6px' }}>
                +{item.candidate.skills.length - 4} more
              </span>
            )}
          </div>

          {/* Achievements summary if present */}
          {item.achievements && item.achievements.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', alignItems: 'center' }}>
              <Medal size={13} style={{ color: '#eab308' }} />
              <span style={{ fontSize: '11px', color: '#eab308', fontWeight: 600 }}>Achievements:</span>
              {item.achievements.slice(0, 2).map((ach, idx) => (
                <span key={idx} style={{
                  padding: '1px 6px', borderRadius: '4px', fontSize: '10px',
                  background: 'rgba(234,179,8,0.08)', color: '#eab308',
                  border: '1px solid rgba(234,179,8,0.2)', whiteSpace: 'nowrap'
                }}>{ach}</span>
              ))}
              {item.achievements.length > 2 && (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+{item.achievements.length - 2} more</span>
              )}
            </div>
          )}
        </div>

        {/* Score ring + bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Mini score bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '130px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '1px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Brain size={9} /> AI Match</span>
                <span style={{ fontWeight: 600, color: getScoreColor(item.aiScore) }}>{item.aiScore}%</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${item.aiScore}%`, background: getScoreColor(item.aiScore), borderRadius: '999px' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '1px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Target size={9} /> Similarity</span>
                <span style={{ fontWeight: 600, color: getScoreColor(item.embeddingScore) }}>{item.embeddingScore}%</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${item.embeddingScore}%`, background: getScoreColor(item.embeddingScore), borderRadius: '999px' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '1px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={9} /> BM25 Score</span>
                <span style={{ fontWeight: 600, color: getScoreColor(item.bm25Score) }}>{item.bm25Score}%</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${item.bm25Score}%`, background: getScoreColor(item.bm25Score), borderRadius: '999px' }} />
              </div>
            </div>
          </div>

          {/* Score ring */}
          <ScoreRing score={item.finalScore} size={64} />

          {/* Expand chevron */}
          <ChevronDown size={16} color="var(--text-muted)" style={{ transition: 'transform 0.3s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }} />
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div style={{
          marginTop: '20px', paddingTop: '20px',
          borderTop: '1px solid var(--glass-border)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'
        }}
          onClick={e => e.stopPropagation()}
        >
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              All Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {(item.candidate.skills || []).map(s => <SkillBadge key={s} skill={s} />)}
            </div>

            {item.achievements && item.achievements.length > 0 && (
              <>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trophy size={12} color="#eab308" /> Standout Achievements
                </div>
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {item.achievements.map((ach, i) => <li key={i}>{ach}</li>)}
                </ul>
              </>
            )}
          </div>
          {item.aiReasoning && (
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Brain size={12} /> AI Analysis
              </div>
              <div style={{
                fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6',
                background: 'rgba(99,102,241,0.06)', borderRadius: '10px', padding: '12px',
                border: '1px solid rgba(99,102,241,0.12)'
              }}>
                {item.aiReasoning}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const RankingPage: React.FC = () => {
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [rankingData, setRankingData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTop10Only, setShowTop10Only] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');

  useEffect(() => {
    apiClient.get('/jobs').then(r => setJobs(r.data.data || [])).catch(console.error);
  }, []);

  const handleRank = async () => {
    if (!selectedJobId) return;
    setLoading(true);
    setError('');
    setRankingData(null);
    setEmailSuccess('');
    try {
      const res = await apiClient.get(`/jobs/${selectedJobId}/rank`);
      setRankingData(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to rank candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleSendShortlistEmails = async () => {
    if (!rankingData) return;
    setEmailSending(true);
    setEmailSuccess('');
    try {
      // Shortlist candidates in top 10
      const top10Candidates = rankingData.rankedCandidates.slice(0, 10);
      const candidateIds = top10Candidates.map(c => c.candidate.id);

      if (candidateIds.length === 0) {
        setError('No candidates available to notify.');
        return;
      }

      await apiClient.post(`/jobs/${selectedJobId}/applications/notify-shortlisted`, {
        candidateIds
      });

      setEmailSuccess(`Shortlisting email invitations have been sent to top ${candidateIds.length} candidate(s) successfully!`);
      
      // Refresh ranking data to reflect status updates
      const res = await apiClient.get(`/jobs/${selectedJobId}/rank`);
      setRankingData(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to send shortlist emails.');
    } finally {
      setEmailSending(false);
    }
  };

  const topScore = rankingData?.rankedCandidates?.[0]?.finalScore ?? 0;
  const avgScore = rankingData?.rankedCandidates?.length
    ? Math.round(rankingData.rankedCandidates.reduce((s, c) => s + c.finalScore, 0) / rankingData.rankedCandidates.length)
    : 0;

  const displayedCandidates = rankingData?.rankedCandidates
    ? (showTop10Only ? rankingData.rankedCandidates.slice(0, 10) : rankingData.rankedCandidates)
    : [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            padding: '10px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.2))',
            border: '1px solid rgba(99,102,241,0.3)'
          }}>
            <Trophy size={24} style={{ color: '#FFD700' }} />
          </div>
          <h1 className="text-gradient" style={{ margin: 0 }}>AI Hybrid Candidate Ranking</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
          Hybrid matching using AI evaluation + Cosine dense similarity + BM25 keyword matching + achievement priority.
        </p>
      </div>

      {/* Job Selector */}
      <div className="glass-card" style={{ marginBottom: '28px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
        <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
          <label>Select Job Position</label>
          <select className="input-field" value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)}>
            <option value="">-- Choose a Job to Rank Candidates --</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
        <button
          className="btn btn-primary"
          style={{ padding: '12px 28px', flexShrink: 0, gap: '8px' }}
          disabled={!selectedJobId || loading}
          onClick={handleRank}
        >
          {loading ? <><Loader size={16} className="animate-spin" /> Ranking...</> : <><TrendingUp size={16} /> Rank Candidates</>}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '16px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444',
          display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px'
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Results */}
      {rankingData && (
        <>
          {/* Summary stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
            {[
              { label: 'Job Position', value: rankingData.jobTitle, icon: <Briefcase size={18} />, color: '#6366f1' },
              { label: 'Total Applicants', value: rankingData.rankedCandidates.length, icon: <Users size={18} />, color: '#10b981' },
              { label: 'Top Score', value: `${topScore}/100`, icon: <Star size={18} />, color: '#FFD700' },
              { label: 'Average Score', value: `${avgScore}/100`, icon: <Target size={18} />, color: '#f59e0b' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(15,18,35,0.7)', border: '1px solid var(--glass-border)',
                borderRadius: '14px', padding: '20px', backdropFilter: 'blur(12px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Action Toolbar */}
          {rankingData.rankedCandidates.length > 0 && (
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '16px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Filters:</span>
                <button 
                  className={`btn ${showTop10Only ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px', width: 'auto' }}
                  onClick={() => setShowTop10Only(!showTop10Only)}
                >
                  {showTop10Only ? 'Show All Candidates' : 'Show Top 10 Only'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  className="btn"
                  style={{ 
                    padding: '8px 18px', 
                    fontSize: '13px', 
                    borderRadius: '8px', 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                    color: 'white',
                    border: 'none', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  disabled={emailSending}
                  onClick={handleSendShortlistEmails}
                >
                  {emailSending ? <><Loader size={14} className="animate-spin" /> Notifying...</> : <><CheckCircle size={14} /> Send Shortlist Mail to Top 10</>}
                </button>
              </div>
            </div>
          )}

          {emailSuccess && (
            <div style={{
              padding: '12px 18px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)', color: '#10b981',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px'
            }}>
              <CheckCircle size={16} /> {emailSuccess}
            </div>
          )}

          {/* Candidates list */}
          {rankingData.rankedCandidates.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <div style={{ fontSize: '16px' }}>No applicants found for this job yet.</div>
              <div style={{ fontSize: '13px', marginTop: '8px' }}>Upload resumes on the Resumes page first.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayedCandidates.map(item => (
                <CandidateCard key={item.applicationId} item={item} isTop3={item.rank <= 3} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!rankingData && !loading && !error && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '360px', color: 'var(--text-muted)', textAlign: 'center'
        }}>
          <div style={{
            width: '96px', height: '96px', borderRadius: '50%', marginBottom: '24px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Trophy size={40} style={{ color: '#FFD700', opacity: 0.6 }} />
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Select a job and click "Rank Candidates"
          </div>
          <div style={{ fontSize: '13px', maxWidth: '380px' }}>
            The AI will rank applicants using a hybrid formula: Groq LLM evaluation + Vector dense similarity + BM25 sparse keyword similarity + Achievement priority.
          </div>
        </div>
      )}
    </div>
  );
};
