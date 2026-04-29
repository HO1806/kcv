import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { db, getSettings, exportAllData, importAllData } from "../db";
import { useTheme } from "../hooks/useTheme";
import { useAppStore } from "../store";
import { downloadFile } from "../lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SectionHeading } from "../components/settings/SectionHeading";
import {
  SectionNav,
  SectionRail,
  type SettingsSection,
  type SettingsSectionId,
} from "../components/settings/SectionNav";
import {
  ThemeCard,
  type ThemeCardValue,
} from "../components/settings/ThemeCard";
import { LanguageSegmented } from "../components/settings/LanguageSegmented";
import { ApiKeyField } from "../components/settings/ApiKeyField";
import { DataActions } from "../components/settings/DataActions";
import { DangerZone } from "../components/settings/DangerZone";

const APP_VERSION = "v.42";
const QUOTA_LIMIT = 250;

interface ImportMessage {
  type: "success" | "error";
  text: string;
}

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useAppStore();

  const settings = useLiveQuery(() => db.settings.get("singleton"), []);
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<ImportMessage | null>(null);
  const [active, setActive] = useState<SettingsSectionId>("appearance");

  // Seed the local input from settings — only when the persisted key changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (settings) setApiKey(settings.geminiApiKey);
  }, [settings]);

  // Ensure singleton row exists on mount (mirrors prior behavior).
  useEffect(() => {
    void getSettings();
  }, []);

  const sections = useMemo<ReadonlyArray<SettingsSection>>(
    () => [
      { id: "appearance", label: t("settings.theme") },
      { id: "apiKey", label: t("settings.apiKey") },
      { id: "data", label: t("settings.dataManagement") },
      { id: "about", label: t("settings.about") },
    ],
    [t],
  );

  const activeSection = sections.find((s) => s.id === active);

  function handleLanguageChange(lang: "fr" | "en") {
    setLanguage(lang);
    void i18n.changeLanguage(lang);
  }

  async function saveApiKey() {
    await db.settings.update("singleton", { geminiApiKey: apiKey });
    setSaved(true);
    toast.success(t("settings.saved", { defaultValue: "Clé enregistrée" }));
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleExport() {
    try {
      const json = await exportAllData();
      downloadFile(
        json,
        `cv-builder-backup-${Date.now()}.json`,
        "application/json",
      );
      toast.success("Sauvegarde exportée");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Échec de l'export.";
      toast.error(message);
    }
  }

  async function handleImport(file: File) {
    setImporting(true);
    setImportMessage(null);
    try {
      const text = await file.text();
      await importAllData(text);
      setImportMessage({
        type: "success",
        text: "Données importées avec succès. Rechargez la page pour voir les changements.",
      });
    } catch {
      setImportMessage({
        type: "error",
        text: "Échec de l'import — vérifiez que le fichier est une sauvegarde CV Builder valide.",
      });
    } finally {
      setImporting(false);
    }
  }

  async function handleReset() {
    const ok = window.confirm(
      "Réinitialiser toutes les données ? Cette action supprimera profils et candidatures et est irréversible.",
    );
    if (!ok) return;
    await db.transaction(
      "rw",
      [db.profiles, db.applications, db.baseCvs, db.customTemplates],
      async () => {
        await Promise.all([
          db.profiles.clear(),
          db.applications.clear(),
          db.baseCvs.clear(),
          db.customTemplates.clear(),
        ]);
      },
    );
    toast.success("Toutes les données ont été supprimées. Rechargez la page.");
  }

  if (!settings) {
    return (
      <div className="p-8 text-sm text-(--c-on-surface-muted)">
        {t("common.loading")}
      </div>
    );
  }

  const quotaUsed = settings.geminiQuotaUsed ?? 0;
  const hasKey = settings.geminiApiKey.length > 0;

  return (
    <div className="h-full overflow-y-auto bg-(--c-surface)">
      <div className="mx-auto max-w-5xl p-4 md:p-8 flex flex-col gap-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("settings.title")}</BreadcrumbPage>
            </BreadcrumbItem>
            {activeSection && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{activeSection.label}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <header>
          <h1 className="ks-display">{t("settings.title")}</h1>
          <p className="ks-body-sm mt-1">{t("settings.subtitle")}</p>
        </header>

        {/* Mobile horizontal nav */}
        <SectionNav sections={sections} active={active} onSelect={setActive} />

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
          {/* Sidebar (desktop) */}
          <aside className="hidden md:block">
            <SectionRail
              sections={sections}
              active={active}
              onSelect={setActive}
            />
            <p className="mt-6 text-xs text-(--c-on-surface-muted)">
              Version <span className="font-mono">{APP_VERSION}</span>
            </p>
          </aside>

          {/* Main */}
          <main className="flex flex-col gap-6 min-w-0">
            {/* Apparence */}
            {active === "appearance" && (
              <Card data-size="sm" className="ring-(--c-outline) bg-(--c-surface-bright)">
                <CardContent className="p-6 flex flex-col gap-6">
                  <SectionHeading icon="palette" label="Thème" />

                  <div
                    className="grid grid-cols-1 gap-3 md:grid-cols-3"
                    role="radiogroup"
                    aria-label={t("settings.theme")}
                  >
                    {(
                      [
                        {
                          value: "light",
                          label: t("settings.themeLight"),
                          description: "Pour la lecture diurne",
                        },
                        {
                          value: "dark",
                          label: t("settings.themeDark"),
                          description: "Pour le travail nocturne",
                        },
                        {
                          value: "system",
                          label: t("settings.themeSystem"),
                          description: "Suit votre OS",
                        },
                      ] satisfies ReadonlyArray<{
                        value: ThemeCardValue;
                        label: string;
                        description: string;
                      }>
                    ).map((opt) => (
                      <ThemeCard
                        key={opt.value}
                        value={opt.value}
                        label={opt.label}
                        description={opt.description}
                        active={theme === opt.value}
                        onSelect={setTheme}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <SectionHeading
                      icon="translate"
                      label={t("settings.language")}
                    />
                    <LanguageSegmented
                      value={language}
                      onChange={handleLanguageChange}
                    />
                    <p className="text-xs text-(--c-on-surface-muted)">
                      Affecte uniquement l&apos;interface, pas les CV.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clé API Gemini */}
            {active === "apiKey" && (
              <Card data-size="sm" className="ring-(--c-outline) bg-(--c-surface-bright)">
                <CardContent className="p-6 flex flex-col gap-4">
                  <p className="ks-body-sm">{t("settings.apiKeyDesc")}</p>

                  <ApiKeyField
                    value={apiKey}
                    onChange={setApiKey}
                    onSave={saveApiKey}
                    saved={saved}
                    saveLabel={t("settings.save")}
                    savedLabel={t("settings.saved")}
                    quotaUsed={quotaUsed}
                    quotaLimit={QUOTA_LIMIT}
                    helpText="Limite quotidienne — réinitialisation à minuit UTC"
                    getKeyLabel={t("settings.getKey")}
                    getKeyHref="https://aistudio.google.com/app/apikey"
                    statusText={
                      hasKey
                        ? t("settings.apiKeyConfigured")
                        : t("settings.apiKeyMissing")
                    }
                    statusKind={hasKey ? "ok" : "warn"}
                  />
                </CardContent>
              </Card>
            )}

            {/* Données */}
            {active === "data" && (
              <Card data-size="sm" className="ring-(--c-outline) bg-(--c-surface-bright)">
                <CardContent className="p-6 flex flex-col gap-6">
                  <p className="ks-body-sm">{t("settings.dataDesc")}</p>

                  <DataActions
                    exportLabel={`${t("settings.export")} JSON`}
                    importLabel={`${t("settings.import")} JSON`}
                    importing={importing}
                    message={importMessage}
                    onExport={handleExport}
                    onImport={handleImport}
                  />

                  <DangerZone
                    title="Zone de danger"
                    description="Efface définitivement toutes vos données locales."
                    buttonLabel="Réinitialiser"
                    onReset={handleReset}
                  />
                </CardContent>
              </Card>
            )}

            {/* À propos */}
            {active === "about" && (
              <Card data-size="sm" className="ring-(--c-outline) bg-(--c-surface-bright)">
                <CardContent className="p-6 flex flex-col gap-4">
                  <p className="ks-body-sm">{t("settings.aboutDesc")}</p>

                  <dl
                    className="grid grid-cols-2 gap-3 border-t pt-4 text-xs"
                    style={{ borderColor: "var(--c-outline)" }}
                  >
                    <div>
                      <dt className="ks-caption">Version</dt>
                      <dd className="mt-0.5 font-mono text-(--c-on-surface)">
                        {APP_VERSION}
                      </dd>
                    </div>
                    <div>
                      <dt className="ks-caption">Copyright</dt>
                      <dd className="mt-0.5 text-(--c-on-surface)">
                        Kosovo CV © {new Date().getFullYear()}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-3 text-xs text-(--c-on-surface-muted)">
                    <span>Vite + React</span>
                    <span aria-hidden>·</span>
                    <span>Dexie.js</span>
                    <span aria-hidden>·</span>
                    <span>Gemini 2.5 Flash</span>
                    <span aria-hidden>·</span>
                    <span>Local-first</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
