import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type SettingsSectionId = 'appearance' | 'apiKey' | 'data' | 'about'

export interface SettingsSection {
  id: SettingsSectionId
  label: string
}

interface SectionNavProps {
  sections: ReadonlyArray<SettingsSection>
  active: SettingsSectionId
  onSelect: (id: SettingsSectionId) => void
}

/**
 * Mobile horizontal tabs across the top.
 */
export function SectionNav({ sections, active, onSelect }: SectionNavProps) {
  return (
    <div className="md:hidden">
      <Tabs
        value={active}
        onValueChange={(v) => onSelect(v as SettingsSectionId)}
        aria-label="Sections des paramètres"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {sections.map((s) => (
            <TabsTrigger key={s.id} value={s.id}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}

/**
 * Desktop vertical tabs rail.
 */
export function SectionRail({ sections, active, onSelect }: SectionNavProps) {
  return (
    <Tabs
      orientation="vertical"
      value={active}
      onValueChange={(v) => onSelect(v as SettingsSectionId)}
      aria-label="Sections des paramètres"
      className="w-full"
    >
      <TabsList variant="line" className="w-full bg-transparent items-stretch flex-col h-fit p-0">
        {sections.map((s) => (
          <TabsTrigger
            key={s.id}
            value={s.id}
            className="justify-start text-sm"
          >
            {s.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
