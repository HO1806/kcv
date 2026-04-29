import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import {
  LayoutList,
  Briefcase,
  User,
  Settings,
  FileText,
  Sun,
  Languages,
  Key,
  GraduationCap,
  Wrench,
  Globe,
  Award,
  Bot,
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAppStore, type EditorSection } from '@/store'

type Theme = 'light' | 'dark' | 'system'

function nextTheme(current: Theme): Theme {
  if (current === 'light') return 'dark'
  if (current === 'dark') return 'system'
  return 'light'
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const setEditorSection = useAppStore((s) => s.setEditorSection)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const run = useCallback((action: () => void) => {
    setOpen(false)
    action()
  }, [])

  const goEditTab = useCallback(
    (section: EditorSection) => {
      setEditorSection(section)
      navigate('/edit')
    },
    [navigate, setEditorSection]
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t('cmdk.placeholder')} />
      <CommandList>
        <CommandEmpty>{t('cmdk.empty')}</CommandEmpty>

        <CommandGroup heading={t('cmdk.pageGroup')}>
          <CommandItem onSelect={() => run(() => navigate('/applications'))}>
            <LayoutList />
            <span>{t('nav.applications')}</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/apply'))}>
            <Briefcase />
            <span>{t('nav.applyJob')}</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/edit'))}>
            <User />
            <span>{t('nav.profiles')}</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/settings'))}>
            <Settings />
            <span>{t('nav.settings')}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('cmdk.profileGroup')}>
          <CommandItem onSelect={() => run(() => goEditTab('personal'))}>
            <User />
            <span>{t('profileEdit.tabs.personal')}</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => goEditTab('experience'))}>
            <Briefcase />
            <span>{t('profileEdit.tabs.experience')}</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => goEditTab('education'))}>
            <GraduationCap />
            <span>{t('profileEdit.tabs.education')}</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => goEditTab('skills'))}>
            <Wrench />
            <span>{t('profileEdit.tabs.skills')}</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => goEditTab('languages'))}>
            <Globe />
            <span>{t('profileEdit.tabs.languages')}</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => goEditTab('certifications'))}>
            <Award />
            <span>{t('profileEdit.tabs.certifications')}</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => goEditTab('aiContext'))}>
            <Bot />
            <span>{t('profileEdit.tabs.aiContext')}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t('cmdk.actionsGroup')}>
          <CommandItem onSelect={() => run(() => navigate('/apply'))}>
            <Briefcase />
            <span>{t('cmdk.action.applyJob')}</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/edit'))}>
            <FileText />
            <span>{t('cmdk.action.generateBaseCV')}</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => setTheme(nextTheme(theme)))}>
            <Sun />
            <span>{t('cmdk.action.toggleTheme')}</span>
          </CommandItem>
          <CommandItem
            onSelect={() => run(() => setLanguage(language === 'fr' ? 'en' : 'fr'))}
          >
            <Languages />
            <span>{t('cmdk.action.toggleLanguage')}</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/settings#api-key'))}>
            <Key />
            <span>{t('cmdk.action.configureKey')}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
