import type { Profile, BaseCV, JobApplication, EnhancedExperience } from '../../../types'
import { isJobApplication } from '../../../types'
import { formatDate } from '../../../lib/utils'

type CVData = {
  profile: Profile
  cv: BaseCV | JobApplication
  targetJob?: string
}

const ACCENT = '#0891b2' // Pikachu's signature cyan
const SIDEBAR_BG = '#f1f5f9'

function getBullets(cv: BaseCV | JobApplication, experienceId: string): string[] {
  const enhanced = isJobApplication(cv) ? cv.adaptedExperience : cv.enhancedExperience
  const found = enhanced.find((e: EnhancedExperience) => e.experienceId === experienceId)
  return found?.enhancedBullets ?? []
}

function getSummary(cv: BaseCV | JobApplication): string {
  return isJobApplication(cv) ? cv.adaptedSummary : cv.enhancedSummary
}

export function Pikachu({ profile, cv, targetJob }: CVData) {
  const { personal, experience, education, skills, languages, certifications } = profile
  const skillCats: Array<{ key: 'technical' | 'tool' | 'soft'; label: string }> = [
    { key: 'technical', label: 'Techniques' },
    { key: 'tool', label: 'Outils' },
    { key: 'soft', label: 'Soft Skills' },
  ]

  return (
    <div
      id="cv-print-area"
      style={{
        background: '#fff',
        color: '#0f172a',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
        fontSize: '10pt',
        lineHeight: 1.5,
        maxWidth: '210mm',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '32% 68%',
      }}
    >
      {/* Sidebar */}
      <aside style={{ background: SIDEBAR_BG, padding: '20mm 12mm', minHeight: '297mm' }}>
        {personal.photo && (
          <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
            <img
              src={personal.photo}
              alt=""
              style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${ACCENT}` }}
            />
          </div>
        )}

        <SidebarHeading>Contact</SidebarHeading>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '9pt' }}>
          {personal.email && <li style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{personal.email}</li>}
          {personal.phone && <li style={{ marginBottom: '4px' }}>{personal.phone}</li>}
          {personal.city && <li style={{ marginBottom: '4px' }}>{personal.city}</li>}
          {personal.linkedin && <li style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{personal.linkedin}</li>}
          {personal.website && <li style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{personal.website}</li>}
        </ul>

        {skillCats.some((c) => skills.some((s) => s.category === c.key)) && (
          <>
            <SidebarHeading>Compétences</SidebarHeading>
            {skillCats.map(({ key, label }) => {
              const list = skills.filter((s) => s.category === key)
              if (list.length === 0) return null
              return (
                <div key={key} style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '8.5pt', fontWeight: 600, color: '#475569', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                  <p style={{ fontSize: '9pt', margin: 0, lineHeight: 1.4 }}>{list.map((s) => s.name).join(' · ')}</p>
                </div>
              )
            })}
          </>
        )}

        {languages.length > 0 && (
          <>
            <SidebarHeading>Langues</SidebarHeading>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '9pt' }}>
              {languages.map((l) => (
                <li key={l.id} style={{ marginBottom: '4px' }}>
                  <strong>{l.name}</strong> <span style={{ color: '#64748b' }}>· {l.level}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {certifications.length > 0 && (
          <>
            <SidebarHeading>Certifications</SidebarHeading>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '9pt' }}>
              {certifications.map((c) => (
                <li key={c.id} style={{ marginBottom: '6px' }}>
                  <strong>{c.name}</strong>
                  {c.issuer ? <div style={{ color: '#64748b', fontSize: '8.5pt' }}>{c.issuer}</div> : null}
                  {c.date ? <div style={{ color: '#94a3b8', fontSize: '8pt' }}>{formatDate(c.date)}</div> : null}
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>

      {/* Main */}
      <main style={{ padding: '20mm 14mm 18mm' }}>
        <header style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '26pt', fontWeight: 700, margin: 0, color: '#0f172a', lineHeight: 1.1 }}>
            {personal.name}
          </h1>
          {targetJob && (
            <p style={{ fontSize: '13pt', color: ACCENT, margin: '4px 0 0', fontWeight: 500 }}>{targetJob}</p>
          )}
        </header>

        {getSummary(cv) && (
          <Section title="Profil">
            <p style={{ margin: 0, fontSize: '10pt', textAlign: 'justify' }}>{getSummary(cv)}</p>
          </Section>
        )}

        {experience.length > 0 && (
          <Section title="Expérience">
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
                  <p style={{ margin: '1px 0 4px', fontSize: '10pt', color: ACCENT, fontWeight: 500 }}>
                    {exp.company}{exp.city ? ` · ${exp.city}` : ''}
                  </p>
                  {bullets.length > 0 && (
                    <ul style={{ margin: '4px 0 0 0', padding: '0 0 0 16px', listStyleType: 'disc' }}>
                      {bullets.map((b, i) => <li key={i} style={{ fontSize: '9.5pt', marginBottom: '2px' }}>{b}</li>)}
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
                <p style={{ margin: '1px 0', fontSize: '10pt', color: ACCENT, fontWeight: 500 }}>
                  {edu.institution}{edu.city ? ` · ${edu.city}` : ''}
                </p>
              </div>
            ))}
          </Section>
        )}
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '14px' }}>
      <h2 style={{
        fontSize: '11pt',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: ACCENT,
        margin: '0 0 6px',
        paddingBottom: '3px',
        borderBottom: `2px solid ${ACCENT}`,
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: '10pt',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: ACCENT,
      margin: '14px 0 6px',
    }}>
      {children}
    </h2>
  )
}
