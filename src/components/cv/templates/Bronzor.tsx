import type { Profile, BaseCV, JobApplication, EnhancedExperience } from '../../../types'
import { isJobApplication } from '../../../types'
import { formatDate } from '../../../lib/utils'

type CVData = {
  profile: Profile
  cv: BaseCV | JobApplication
  targetJob?: string
}

const ACCENT = '#7c3aed' // Bronzor's signature violet

function getBullets(cv: BaseCV | JobApplication, experienceId: string): string[] {
  const enhanced = isJobApplication(cv) ? cv.adaptedExperience : cv.enhancedExperience
  const found = enhanced.find((e: EnhancedExperience) => e.experienceId === experienceId)
  return found?.enhancedBullets ?? []
}

function getSummary(cv: BaseCV | JobApplication): string {
  return isJobApplication(cv) ? cv.adaptedSummary : cv.enhancedSummary
}

export function Bronzor({ profile, cv, targetJob }: CVData) {
  const { personal, experience, education, skills, languages, certifications } = profile
  const contactItems = [personal.email, personal.phone, personal.city, personal.linkedin, personal.website].filter(Boolean)

  return (
    <div
      id="cv-print-area"
      style={{
        background: '#fff',
        color: '#0f172a',
        fontFamily: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
        fontSize: '10.5pt',
        lineHeight: 1.5,
        padding: '18mm 16mm',
        maxWidth: '210mm',
        margin: '0 auto',
      }}
    >
      {/* Centered header */}
      <header style={{ textAlign: 'center', marginBottom: '14px' }}>
        {personal.photo && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <img
              src={personal.photo}
              alt=""
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${ACCENT}` }}
            />
          </div>
        )}
        <h1 style={{ fontSize: '24pt', fontWeight: 700, margin: 0, letterSpacing: '0.5px', color: '#0f172a' }}>
          {personal.name}
        </h1>
        {targetJob && (
          <p style={{ fontSize: '12pt', color: ACCENT, margin: '4px 0 0', fontWeight: 500, letterSpacing: '0.3px' }}>
            {targetJob}
          </p>
        )}
        <p style={{ fontSize: '9.5pt', color: '#475569', margin: '8px 0 0' }}>
          {contactItems.join('  ·  ')}
        </p>
      </header>

      {getSummary(cv) && (
        <Section title="Profil Professionnel">
          <p style={{ margin: 0, textAlign: 'justify' }}>{getSummary(cv)}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Expérience Professionnelle">
          {experience.map((exp) => {
            const bullets = getBullets(cv, exp.id)
            return (
              <div key={exp.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <strong style={{ fontSize: '11pt', color: '#0f172a' }}>{exp.role}</strong>
                  <span style={{ fontSize: '9pt', color: '#64748b' }}>
                    {formatDate(exp.startDate)} – {exp.current ? 'Présent' : formatDate(exp.endDate)}
                  </span>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '10pt', color: ACCENT, fontWeight: 500 }}>
                  {exp.company}{exp.city ? ` · ${exp.city}` : ''}
                </p>
                {bullets.length > 0 && (
                  <ul style={{ margin: '4px 0 0 0', padding: '0 0 0 18px', listStyleType: 'disc' }}>
                    {bullets.map((b, i) => (
                      <li key={i} style={{ fontSize: '10pt', marginBottom: '2px' }}>{b}</li>
                    ))}
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
              <p style={{ margin: '1px 0 0', fontSize: '10pt', color: ACCENT, fontWeight: 500 }}>
                {edu.institution}{edu.city ? ` · ${edu.city}` : ''}
              </p>
              {edu.description && (
                <p style={{ margin: '2px 0 0', fontSize: '9.5pt', color: '#64748b' }}>{edu.description}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Compétences">
          <p style={{ margin: 0, fontSize: '10pt' }}>
            {skills.map((s) => s.name).join('  ·  ')}
          </p>
        </Section>
      )}

      {languages.length > 0 && (
        <Section title="Langues">
          <p style={{ margin: 0, fontSize: '10pt' }}>
            {languages.map((l) => `${l.name} (${l.level})`).join('  ·  ')}
          </p>
        </Section>
      )}

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '14px', paddingTop: '8px', borderTop: `1px solid ${ACCENT}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 4fr', gap: '12px', alignItems: 'start' }}>
        <h2 style={{
          fontSize: '10pt',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: ACCENT,
          margin: 0,
          paddingTop: '2px',
        }}>
          {title}
        </h2>
        <div className="section-content">{children}</div>
      </div>
    </section>
  )
}
