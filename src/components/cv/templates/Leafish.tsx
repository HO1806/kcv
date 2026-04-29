import type { Profile, BaseCV, JobApplication, EnhancedExperience } from '../../../types'
import { isJobApplication } from '../../../types'
import { formatDate } from '../../../lib/utils'

type CVData = {
  profile: Profile
  cv: BaseCV | JobApplication
  targetJob?: string
}

const ACCENT = '#15803d' // Leafish green

function getBullets(cv: BaseCV | JobApplication, experienceId: string): string[] {
  const enhanced = isJobApplication(cv) ? cv.adaptedExperience : cv.enhancedExperience
  const found = enhanced.find((e: EnhancedExperience) => e.experienceId === experienceId)
  return found?.enhancedBullets ?? []
}

function getSummary(cv: BaseCV | JobApplication): string {
  return isJobApplication(cv) ? cv.adaptedSummary : cv.enhancedSummary
}

export function Leafish({ profile, cv, targetJob }: CVData) {
  const { personal, experience, education, skills, languages, certifications } = profile

  return (
    <div
      id="cv-print-area"
      style={{
        background: '#fff',
        color: '#0f172a',
        fontFamily: '"Source Sans Pro", system-ui, sans-serif',
        fontSize: '10.5pt',
        lineHeight: 1.5,
        padding: '16mm 16mm',
        maxWidth: '210mm',
        margin: '0 auto',
      }}
    >
      {/* Header — photo + name + contact, French/Moroccan style */}
      <header style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '16px', alignItems: 'start', marginBottom: '14px', paddingBottom: '12px', borderBottom: `3px solid ${ACCENT}` }}>
        {personal.photo ? (
          <img
            src={personal.photo}
            alt=""
            style={{ width: '110px', height: '140px', objectFit: 'cover', borderRadius: '4px', border: `1px solid #e2e8f0` }}
          />
        ) : (
          <div style={{
            width: '110px',
            height: '140px',
            background: '#f1f5f9',
            border: '1px dashed #cbd5e1',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: '9pt',
            textAlign: 'center',
            padding: '8px',
          }}>
            Photo
          </div>
        )}
        <div>
          <h1 style={{ fontSize: '22pt', fontWeight: 700, margin: '0 0 6px', color: '#0f172a', lineHeight: 1.15 }}>
            {personal.name}
          </h1>
          {targetJob && (
            <p style={{ fontSize: '12pt', color: ACCENT, margin: '4px 0 8px', fontWeight: 500 }}>{targetJob}</p>
          )}
          <div style={{ fontSize: '9.5pt', color: '#475569', lineHeight: 1.6 }}>
            {personal.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 6 10-6" />
                </svg>
                {personal.email}
              </div>
            )}
            {personal.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
                </svg>
                {personal.phone}
              </div>
            )}
            {personal.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {personal.city}
              </div>
            )}
            {personal.linkedin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19a.66.66 0 0 0 0 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
                {personal.linkedin}
              </div>
            )}
          </div>
        </div>
      </header>

      {getSummary(cv) && (
        <Section title="Profil Professionnel">
          <p style={{ margin: 0, textAlign: 'justify', fontSize: '10.5pt' }}>{getSummary(cv)}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Expérience Professionnelle">
          {experience.map((exp) => {
            const bullets = getBullets(cv, exp.id)
            return (
              <div key={exp.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '11pt' }}>{exp.role}</strong>
                  <span style={{ fontSize: '9pt', color: '#64748b' }}>
                    {formatDate(exp.startDate)} – {exp.current ? 'Présent' : formatDate(exp.endDate)}
                  </span>
                </div>
                <p style={{ margin: '1px 0 4px', fontSize: '10pt', color: ACCENT, fontWeight: 500, fontStyle: 'italic' }}>
                  {exp.company}{exp.city ? ` · ${exp.city}` : ''}
                </p>
                {bullets.length > 0 && (
                  <ul style={{ margin: '4px 0 0 0', padding: '0 0 0 16px', listStyleType: 'disc' }}>
                    {bullets.map((b, i) => <li key={i} style={{ fontSize: '10pt', marginBottom: '2px' }}>{b}</li>)}
                  </ul>
                )}
              </div>
            )
          })}
        </Section>
      )}

      {education.length > 0 && (
        <Section title="Formation">
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '11pt' }}>{edu.diploma}</strong>
                <span style={{ fontSize: '9pt', color: '#64748b' }}>
                  {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                </span>
              </div>
              <p style={{ margin: '1px 0', fontSize: '10pt', color: ACCENT, fontWeight: 500, fontStyle: 'italic' }}>
                {edu.institution}{edu.city ? ` · ${edu.city}` : ''}
              </p>
            </div>
          ))}
        </Section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {skills.length > 0 && (
          <Section title="Compétences" compact>
            <p style={{ margin: 0, fontSize: '10pt' }}>{skills.map((s) => s.name).join(' · ')}</p>
          </Section>
        )}
        {languages.length > 0 && (
          <Section title="Langues" compact>
            <p style={{ margin: 0, fontSize: '10pt' }}>{languages.map((l) => `${l.name} (${l.level})`).join(' · ')}</p>
          </Section>
        )}
      </div>

      {certifications.length > 0 && (
        <Section title="Certifications">
          {certifications.map((c) => (
            <p key={c.id} style={{ margin: '0 0 3px', fontSize: '10pt' }}>
              <strong>{c.name}</strong>
              {c.issuer ? ` — ${c.issuer}` : ''}
              {c.date ? ` (${formatDate(c.date)})` : ''}
            </p>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children, compact }: { title: string; children: React.ReactNode; compact?: boolean }) {
  return (
    <section style={{ marginBottom: compact ? '8px' : '12px' }}>
      <h2 style={{
        fontSize: '11pt',
        fontWeight: 700,
        color: ACCENT,
        margin: '0 0 6px',
        paddingBottom: '2px',
        borderBottom: `1px solid #cbd5e1`,
        letterSpacing: '0.04em',
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}
