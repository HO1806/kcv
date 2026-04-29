import type { Profile, BaseCV, JobApplication, EnhancedExperience } from '../../../types'
import { isJobApplication } from '../../../types'
import { formatDate } from '../../../lib/utils'

type CVData = {
  profile: Profile
  cv: BaseCV | JobApplication
  targetJob?: string
}

const ACCENT = '#0f172a' // Onyx — almost-black

function getBullets(cv: BaseCV | JobApplication, experienceId: string): string[] {
  const enhanced = isJobApplication(cv) ? cv.adaptedExperience : cv.enhancedExperience
  const found = enhanced.find((e: EnhancedExperience) => e.experienceId === experienceId)
  return found?.enhancedBullets ?? []
}

function getSummary(cv: BaseCV | JobApplication): string {
  return isJobApplication(cv) ? cv.adaptedSummary : cv.enhancedSummary
}

export function Onyx({ profile, cv, targetJob }: CVData) {
  const { personal, experience, education, skills, languages, certifications } = profile

  return (
    <div
      id="cv-print-area"
      style={{
        background: '#fff',
        color: '#0f172a',
        fontFamily: '"DM Sans", "Helvetica Neue", system-ui, sans-serif',
        fontSize: '10.5pt',
        lineHeight: 1.55,
        padding: '20mm 18mm',
        maxWidth: '210mm',
        margin: '0 auto',
      }}
    >
      {/* Bold header block — name left, optional square photo right */}
      <header style={{ borderBottom: `4px solid ${ACCENT}`, paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: '32pt',
            fontWeight: 800,
            margin: 0,
            letterSpacing: '-1px',
            color: ACCENT,
            lineHeight: 1.05,
          }}>
            {personal.name}
          </h1>
          {targetJob && (
            <p style={{
              fontSize: '13pt',
              color: '#475569',
              margin: '4px 0 0',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}>
              {targetJob}
            </p>
          )}
          <p style={{ fontSize: '9.5pt', color: '#475569', margin: '10px 0 0' }}>
            {[personal.email, personal.phone, personal.city, personal.linkedin, personal.website].filter(Boolean).join('  ·  ')}
          </p>
        </div>
        {personal.photo && (
          <img
            src={personal.photo}
            alt=""
            style={{ width: '88px', height: '88px', objectFit: 'cover', border: `3px solid ${ACCENT}`, flexShrink: 0 }}
          />
        )}
      </header>

      {getSummary(cv) && (
        <Section title="Profil">
          <p style={{ margin: 0, fontSize: '11pt', lineHeight: 1.6, fontWeight: 400 }}>{getSummary(cv)}</p>
        </Section>
      )}

      {experience.length > 0 && (
        <Section title="Expérience">
          {experience.map((exp) => {
            const bullets = getBullets(cv, exp.id)
            return (
              <div key={exp.id} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '12pt', color: ACCENT, fontWeight: 700 }}>{exp.role}</strong>
                  <span style={{ fontSize: '9pt', color: '#64748b', fontVariant: 'tabular-nums', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {formatDate(exp.startDate)} – {exp.current ? 'Présent' : formatDate(exp.endDate)}
                  </span>
                </div>
                <p style={{ margin: '2px 0 4px', fontSize: '10pt', color: '#475569', fontWeight: 500 }}>
                  {exp.company}{exp.city ? ` — ${exp.city}` : ''}
                </p>
                {bullets.length > 0 && (
                  <ul style={{ margin: '4px 0 0 0', padding: 0, listStyle: 'none' }}>
                    {bullets.map((b, i) => (
                      <li key={i} style={{ fontSize: '10pt', marginBottom: '3px', paddingLeft: '14px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 0, top: '7px', width: '6px', height: '2px', background: ACCENT }} />
                        {b}
                      </li>
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
                <strong style={{ fontSize: '11pt', fontWeight: 700 }}>{edu.diploma}</strong>
                <span style={{ fontSize: '9pt', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                </span>
              </div>
              <p style={{ margin: '1px 0 0', fontSize: '10pt', color: '#475569' }}>
                {edu.institution}{edu.city ? ` — ${edu.city}` : ''}
              </p>
            </div>
          ))}
        </Section>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {skills.length > 0 && (
          <Section title="Compétences" compact>
            <p style={{ margin: 0, fontSize: '10pt' }}>
              {skills.map((s) => s.name).join('  ·  ')}
            </p>
          </Section>
        )}

        {languages.length > 0 && (
          <Section title="Langues" compact>
            <p style={{ margin: 0, fontSize: '10pt' }}>
              {languages.map((l) => `${l.name} (${l.level})`).join('  ·  ')}
            </p>
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
    <section style={{ marginBottom: compact ? '8px' : '14px' }}>
      <h2 style={{
        fontSize: '10pt',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        color: ACCENT,
        margin: '0 0 6px',
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}
