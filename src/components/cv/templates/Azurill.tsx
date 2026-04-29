import type { Profile, BaseCV, JobApplication, EnhancedExperience } from '../../../types'
import { isJobApplication } from '../../../types'
import { formatDate } from '../../../lib/utils'

type CVData = {
  profile: Profile
  cv: BaseCV | JobApplication
  targetJob?: string
}

const ACCENT = '#2563eb' // Azurill — clean blue

function getBullets(cv: BaseCV | JobApplication, experienceId: string): string[] {
  const enhanced = isJobApplication(cv) ? cv.adaptedExperience : cv.enhancedExperience
  const found = enhanced.find((e: EnhancedExperience) => e.experienceId === experienceId)
  return found?.enhancedBullets ?? []
}

function getSummary(cv: BaseCV | JobApplication): string {
  return isJobApplication(cv) ? cv.adaptedSummary : cv.enhancedSummary
}

export function Azurill({ profile, cv, targetJob }: CVData) {
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
        fontFamily: '"Inter", system-ui, sans-serif',
        fontSize: '10pt',
        lineHeight: 1.5,
        padding: '18mm 16mm',
        maxWidth: '210mm',
        margin: '0 auto',
      }}
    >
      {/* Header centered */}
      <header style={{ textAlign: 'center', marginBottom: '18px' }}>
        {personal.photo && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <img
              src={personal.photo}
              alt=""
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${ACCENT}` }}
            />
          </div>
        )}
        <h1 style={{ fontSize: '22pt', fontWeight: 700, margin: 0, color: '#0f172a' }}>{personal.name}</h1>
        {targetJob && (
          <p style={{ fontSize: '11pt', color: ACCENT, margin: '4px 0 0', fontWeight: 500 }}>{targetJob}</p>
        )}
        <p style={{ fontSize: '9.5pt', color: '#64748b', margin: '8px 0 0' }}>
          {[personal.email, personal.phone, personal.city, personal.linkedin].filter(Boolean).join('  ·  ')}
        </p>
      </header>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '32% 68%', gap: '14px' }}>
        {/* Sidebar */}
        <aside>
          {skillCats.some((c) => skills.some((s) => s.category === c.key)) && (
            <SidebarSection title="Compétences">
              {skillCats.map(({ key, label }) => {
                const list = skills.filter((s) => s.category === key)
                if (list.length === 0) return null
                return (
                  <div key={key} style={{ marginBottom: '6px' }}>
                    <p style={{ fontSize: '8.5pt', fontWeight: 600, color: '#475569', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                    <p style={{ fontSize: '9pt', margin: 0 }}>{list.map((s) => s.name).join(' · ')}</p>
                  </div>
                )
              })}
            </SidebarSection>
          )}

          {languages.length > 0 && (
            <SidebarSection title="Langues">
              {languages.map((l) => (
                <p key={l.id} style={{ margin: '0 0 3px', fontSize: '9pt' }}>
                  <strong>{l.name}</strong> <span style={{ color: '#64748b' }}>· {l.level}</span>
                </p>
              ))}
            </SidebarSection>
          )}

          {certifications.length > 0 && (
            <SidebarSection title="Certifications">
              {certifications.map((c) => (
                <div key={c.id} style={{ marginBottom: '5px' }}>
                  <p style={{ margin: 0, fontSize: '9pt', fontWeight: 600 }}>{c.name}</p>
                  {c.issuer ? <p style={{ margin: 0, fontSize: '8.5pt', color: '#64748b' }}>{c.issuer}</p> : null}
                  {c.date ? <p style={{ margin: 0, fontSize: '8pt', color: '#94a3b8' }}>{formatDate(c.date)}</p> : null}
                </div>
              ))}
            </SidebarSection>
          )}
        </aside>

        {/* Main with timeline */}
        <main>
          {getSummary(cv) && (
            <MainSection title="Profil Professionnel">
              <p style={{ margin: 0, fontSize: '10pt', textAlign: 'justify' }}>{getSummary(cv)}</p>
            </MainSection>
          )}

          {experience.length > 0 && (
            <MainSection title="Expérience">
              <div style={{ borderLeft: `2px solid ${ACCENT}`, paddingLeft: '12px', marginLeft: '4px' }}>
                {experience.map((exp) => {
                  const bullets = getBullets(cv, exp.id)
                  return (
                    <div key={exp.id} style={{ position: 'relative', marginBottom: '12px' }}>
                      <span style={{
                        position: 'absolute',
                        left: '-19px',
                        top: '6px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#fff',
                        border: `2px solid ${ACCENT}`,
                      }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: '11pt' }}>{exp.role}</strong>
                        <span style={{ fontSize: '9pt', color: '#64748b' }}>
                          {formatDate(exp.startDate)} – {exp.current ? 'Présent' : formatDate(exp.endDate)}
                        </span>
                      </div>
                      <p style={{ margin: '1px 0 4px', fontSize: '9.5pt', color: ACCENT, fontWeight: 500 }}>
                        {exp.company}{exp.city ? ` · ${exp.city}` : ''}
                      </p>
                      {bullets.length > 0 && (
                        <ul style={{ margin: '4px 0 0 0', padding: '0 0 0 14px', listStyleType: 'disc' }}>
                          {bullets.map((b, i) => <li key={i} style={{ fontSize: '9.5pt', marginBottom: '2px' }}>{b}</li>)}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
            </MainSection>
          )}

          {education.length > 0 && (
            <MainSection title="Formation">
              <div style={{ borderLeft: `2px solid ${ACCENT}`, paddingLeft: '12px', marginLeft: '4px' }}>
                {education.map((edu) => (
                  <div key={edu.id} style={{ position: 'relative', marginBottom: '8px' }}>
                    <span style={{
                      position: 'absolute',
                      left: '-19px',
                      top: '6px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#fff',
                      border: `2px solid ${ACCENT}`,
                    }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '11pt' }}>{edu.diploma}</strong>
                      <span style={{ fontSize: '9pt', color: '#64748b' }}>
                        {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                      </span>
                    </div>
                    <p style={{ margin: '1px 0 0', fontSize: '9.5pt', color: ACCENT, fontWeight: 500 }}>
                      {edu.institution}{edu.city ? ` · ${edu.city}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </MainSection>
          )}
        </main>
      </div>
    </div>
  )
}

function MainSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '14px' }}>
      <h2 style={{
        fontSize: '10pt',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: ACCENT,
        margin: '0 0 8px',
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: '12px' }}>
      <h2 style={{
        fontSize: '10pt',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: ACCENT,
        margin: '0 0 6px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ACCENT }} />
        {title}
      </h2>
      {children}
    </section>
  )
}
