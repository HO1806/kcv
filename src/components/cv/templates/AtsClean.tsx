import type { Profile, BaseCV, JobApplication, EnhancedExperience } from '../../../types'
import { isJobApplication } from '../../../types'
import { formatDate } from '../../../lib/utils'
import { DiffText } from '../DiffText'

type CVData = {
  profile: Profile
  cv: BaseCV | JobApplication
  targetJob?: string
  /** Source-of-truth CV used to compute word-level diffs. */
  baseCv?: BaseCV | null
  /** When true, render summary/bullets with inline diff highlights vs `baseCv`. */
  showDiff?: boolean
}

function getBullets(cv: BaseCV | JobApplication, experienceId: string): string[] {
  const enhanced = isJobApplication(cv) ? cv.adaptedExperience : cv.enhancedExperience
  const found = enhanced.find((e: EnhancedExperience) => e.experienceId === experienceId)
  return found?.enhancedBullets ?? []
}

function getBaseBullets(baseCv: BaseCV | null | undefined, experienceId: string): string[] {
  if (!baseCv) return []
  const found = baseCv.enhancedExperience.find((e) => e.experienceId === experienceId)
  return found?.enhancedBullets ?? []
}

function getSummary(cv: BaseCV | JobApplication): string {
  return isJobApplication(cv) ? cv.adaptedSummary : cv.enhancedSummary
}

export function AtsClean({ profile, cv, targetJob, baseCv, showDiff }: CVData) {
  const { personal, experience, education, skills, languages, certifications } = profile
  const summary = getSummary(cv)
  const baseSummary = baseCv?.enhancedSummary ?? ''
  const diffOn = Boolean(showDiff && baseCv)

  return (
    <div
      id="cv-print-area"
      className="bg-white text-slate-900 font-sans"
      style={{ fontFamily: 'Georgia, serif', fontSize: '11pt', lineHeight: '1.45', padding: '20mm 18mm', maxWidth: '210mm', margin: '0 auto' }}
    >
      {/* Header */}
      <header style={{ marginBottom: '14px', borderBottom: '2px solid #1e293b', paddingBottom: '10px' }}>
        <h1 style={{ fontSize: '22pt', fontWeight: 700, margin: '0 0 2px', fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
          {personal.name}
        </h1>
        {targetJob && (
          <p style={{ fontSize: '12pt', color: '#2563eb', margin: '0 0 6px', fontWeight: 600 }}>
            {targetJob}
          </p>
        )}
        <p style={{ fontSize: '9.5pt', color: '#475569', margin: 0 }}>
          {[personal.email, personal.phone, personal.city, personal.linkedin]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>

      {/* Summary */}
      {summary && (
        <Section title="Profil Professionnel">
          <p style={{ margin: 0, textAlign: 'justify' }}>
            {diffOn ? <DiffText before={baseSummary} after={summary} /> : summary}
          </p>
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section title="Expérience Professionnelle">
          {experience.map((exp) => {
            const bullets = getBullets(cv, exp.id)
            const baseBullets = diffOn ? getBaseBullets(baseCv, exp.id) : []
            return (
              <div key={exp.id} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '10.5pt' }}>{exp.role}</strong>
                  <span style={{ fontSize: '9pt', color: '#64748b' }}>
                    {formatDate(exp.startDate)} – {exp.current ? 'Présent' : formatDate(exp.endDate)}
                  </span>
                </div>
                <p style={{ margin: '1px 0 4px', fontSize: '9.5pt', color: '#475569' }}>
                  {exp.company}{exp.city ? `, ${exp.city}` : ''}
                </p>
                {bullets.length > 0 && (
                  <ul style={{ margin: '4px 0 0 16px', padding: 0, listStyleType: 'disc' }}>
                    {bullets.map((b, i) => {
                      const baseBullet = baseBullets[i] ?? ''
                      return (
                        <li key={i} style={{ fontSize: '9.5pt', marginBottom: '2px' }}>
                          {diffOn ? <DiffText before={baseBullet} after={b} /> : b}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section title="Formation">
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '10.5pt' }}>{edu.diploma}</strong>
                <span style={{ fontSize: '9pt', color: '#64748b' }}>
                  {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                </span>
              </div>
              <p style={{ margin: '1px 0', fontSize: '9.5pt', color: '#475569' }}>
                {edu.institution}{edu.city ? `, ${edu.city}` : ''}
              </p>
              {edu.description && (
                <p style={{ margin: '2px 0 0', fontSize: '9pt', color: '#64748b' }}>{edu.description}</p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Compétences">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {skills.map((s) => (
              <span key={s.id} style={{ fontSize: '9pt', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 7px' }}>
                {s.name}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <Section title="Langues">
          <p style={{ margin: 0, fontSize: '9.5pt' }}>
            {languages.map((l) => `${l.name} (${l.level})`).join(' · ')}
          </p>
        </Section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <Section title="Certifications">
          {certifications.map((c) => (
            <p key={c.id} style={{ margin: '0 0 3px', fontSize: '9.5pt' }}>
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
    <section style={{ marginBottom: '12px' }}>
      <h2 style={{
        fontSize: '10pt',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#1e293b',
        borderBottom: '1px solid #cbd5e1',
        paddingBottom: '3px',
        marginBottom: '8px',
        fontFamily: 'system-ui, sans-serif',
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}
