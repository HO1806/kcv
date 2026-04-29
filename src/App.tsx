import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProfileLayout } from './components/layout/ProfileLayout'
import { ProfileEditPage } from './pages/ProfileEditPage'
import { BaseCvPage } from './pages/BaseCvPage'
import { ApplyPage } from './pages/ApplyPage'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { SettingsPage } from './pages/SettingsPage'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CommandPalette } from './components/CommandPalette'

export default function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <BrowserRouter>
        <CommandPalette />
        <Routes>
          <Route element={<AppShell />}>
            <Route path="settings" element={<SettingsPage />} />

            <Route element={<ProfileLayout />}>
              <Route index element={<Navigate to="/applications" replace />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="edit" element={<ProfileEditPage />} />
              <Route path="apply" element={<ApplyPage />} />
              {/* CV de Base accessible directly but not in nav */}
              <Route path="cv" element={<BaseCvPage />} />
              {/* Legacy redirects */}
              <Route path="profile/:profileId/edit" element={<Navigate to="/edit" replace />} />
              <Route path="profile/:profileId/cv" element={<Navigate to="/cv" replace />} />
              <Route path="profile/:profileId/apply" element={<Navigate to="/apply" replace />} />
              <Route path="profile/:profileId/applications" element={<Navigate to="/applications" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/applications" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors closeButton position="bottom-right" />
    </TooltipProvider>
  )
}
