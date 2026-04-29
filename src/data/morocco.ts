export const MOROCCO_CITIES = [
  'Rabat',
  'Casablanca',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
  'Safi',
  'El Jadida',
  'Mohammedia',
  'Khouribga',
  'Beni Mellal',
  'Nador',
  'Taza',
  'Settat',
  'Laâyoune',
  'Ksar El Kébir',
  'Larache',
  'Khémisset',
  'Guelmim',
  'Berrechid',
  'Ouarzazate',
  'Dakhla',
  'Al Hoceïma',
  'Tiznit',
  'Ifrane',
  'Azrou',
  'Sidi Kacem',
  'Essaouira',
  'Taroudant',
  'Taourirt',
  'Berkane',
  'Errachidia',
  'Salé',
  'Témara',
  'Ain Sebaa',
  'Hay Hassani',
  'Médiouna',
  'Benslimane',
]

export const EDUCATION_LEVELS = [
  'Bac',
  'Bac+2 (Technicien Spécialisé / BTS)',
  'Bac+3 (Licence)',
  'Bac+4',
  'Bac+5 (Master / Ingénieur)',
  'Doctorat',
  'Formation Professionnelle',
  'Certificat / Attestation',
]

export const EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.fr',
  'yahoo.com',
  'hotmail.com',
  'hotmail.fr',
  'outlook.com',
  'outlook.fr',
  'live.fr',
  'live.com',
  'icloud.com',
  'protonmail.com',
  'msn.com',
]

// OFPPT specializations by sector
export interface OfpptSector {
  label: string
  specializations: string[]
}

export const OFPPT_SECTORS: OfpptSector[] = [
  {
    label: 'Commerce et Distribution',
    specializations: [
      'Technicien Spécialisé en Commerce',
      'Technicien Spécialisé en Vente',
      'Technicien Spécialisé en Distribution',
      'Technicien en Commerce',
      'Agent Technique de Vente',
    ],
  },
  {
    label: 'Gestion et Administration',
    specializations: [
      'Technicien Spécialisé en Gestion des Entreprises',
      'Technicien Spécialisé en Secrétariat de Direction',
      'Technicien Spécialisé en Comptabilité',
      'Technicien en Gestion Administrative',
      'Agent de Bureau',
    ],
  },
  {
    label: 'Informatique et Numérique',
    specializations: [
      'Technicien Spécialisé en Développement Informatique',
      'Technicien Spécialisé en Infrastructure Digitale',
      'Technicien Spécialisé en Réseau Informatique',
      'Technicien Spécialisé en Cybersécurité',
      'Technicien en Informatique',
    ],
  },
  {
    label: 'Hôtellerie et Tourisme',
    specializations: [
      'Technicien Spécialisé en Hébergement',
      'Technicien Spécialisé en Restauration',
      'Technicien Spécialisé en Guide Touristique',
      'Technicien en Cuisine',
      'Technicien en Service de Restauration',
    ],
  },
  {
    label: 'Électrotechnique et Énergie',
    specializations: [
      'Technicien Spécialisé en Électrotechnique',
      'Technicien Spécialisé en Énergie Renouvelable',
      'Technicien Spécialisé en Froid et Climatisation',
      'Technicien en Électricité du Bâtiment',
    ],
  },
  {
    label: 'Génie Civil et BTP',
    specializations: [
      'Technicien Spécialisé en Travaux Publics',
      'Technicien Spécialisé en Architecture',
      'Technicien Spécialisé en Géomètre Topographe',
      'Technicien en Bâtiment',
    ],
  },
  {
    label: 'Industrie et Mécanique',
    specializations: [
      'Technicien Spécialisé en Mécatronique',
      'Technicien Spécialisé en Génie Mécanique',
      'Technicien en Maintenance Industrielle',
      'Technicien en Électromécanique',
      'Opérateur de Production',
    ],
  },
  {
    label: 'Transport et Logistique',
    specializations: [
      'Technicien Spécialisé en Logistique et Transport',
      'Technicien Spécialisé en Transit et Douane',
      'Agent de Transit',
    ],
  },
  {
    label: 'Marketing et Communication',
    specializations: [
      'Technicien Spécialisé en Marketing',
      'Technicien Spécialisé en Communication',
      'Technicien Spécialisé en Design Graphique',
      'Technicien Spécialisé en Publicité',
    ],
  },
  {
    label: 'Santé et Paramédical',
    specializations: [
      'Aide-Soignant',
      'Technicien en Hygiène et Salubrité',
      'Préparateur en Pharmacie',
    ],
  },
  {
    label: 'Agriculture et Agroalimentaire',
    specializations: [
      'Technicien Spécialisé en Agriculture',
      'Technicien Spécialisé en Agroalimentaire',
      'Technicien en Horticulture',
    ],
  },
  {
    label: 'Textile et Habillement',
    specializations: [
      'Technicien Spécialisé en Habillement',
      'Technicien en Coupe-Confection',
      'Modéliste Industriel',
    ],
  },
]

export const OTHER_INSTITUTIONS = [
  'Université Mohammed V – Rabat',
  'Université Hassan II – Casablanca',
  'Université Sidi Mohamed Ben Abdellah – Fès',
  'Université Cadi Ayyad – Marrakech',
  'Université Ibn Tofail – Kénitra',
  'Université Mohammed Premier – Oujda',
  'Université Abdelmalek Essaâdi – Tétouan/Tanger',
  'ISCAE – Institut Supérieur de Commerce et d\'Administration des Entreprises',
  'ENCG – École Nationale de Commerce et de Gestion',
  'ENSA – École Nationale des Sciences Appliquées',
  'FST – Faculté des Sciences et Techniques',
  'EST – École Supérieure de Technologie',
  'ENSET – École Normale Supérieure de l\'Enseignement Technique',
  'EMI – École Mohammadia d\'Ingénieurs',
  'École Polytechnique (UM6P)',
  'HEM – Hautes Études de Management',
  'ISIAM – Institut Supérieur d\'Informatique et des Affaires',
  'IAV Hassan II – Institut Agronomique et Vétérinaire',
  'Lycée professionnel',
  'Autre établissement',
]

// Skills suggestions by category
export interface SkillSuggestion {
  name: string
  category: 'technical' | 'tool' | 'soft'
}

export const SKILL_SUGGESTIONS: Record<string, SkillSuggestion[]> = {
  commercial: [
    { name: 'Prospection commerciale', category: 'technical' },
    { name: 'Négociation', category: 'technical' },
    { name: 'Fidélisation client', category: 'technical' },
    { name: 'Gestion de portefeuille', category: 'technical' },
    { name: 'Techniques de vente', category: 'technical' },
    { name: 'Animation commerciale', category: 'technical' },
    { name: 'Merchandising', category: 'technical' },
    { name: 'Développement commercial', category: 'technical' },
    { name: 'Service client', category: 'technical' },
    { name: 'Gestion des réclamations', category: 'technical' },
  ],
  bureautique: [
    { name: 'Microsoft Excel', category: 'tool' },
    { name: 'Microsoft Word', category: 'tool' },
    { name: 'Microsoft PowerPoint', category: 'tool' },
    { name: 'Microsoft Outlook', category: 'tool' },
    { name: 'Google Sheets', category: 'tool' },
    { name: 'Google Docs', category: 'tool' },
    { name: 'Sage Comptabilité', category: 'tool' },
    { name: 'ERP / SAP', category: 'tool' },
  ],
  digital: [
    { name: 'CRM (Salesforce, HubSpot)', category: 'tool' },
    { name: 'Réseaux sociaux professionnels', category: 'tool' },
    { name: 'Marketing digital', category: 'technical' },
    { name: 'E-commerce', category: 'technical' },
    { name: 'SEO / SEA', category: 'technical' },
    { name: 'Adobe Photoshop', category: 'tool' },
    { name: 'Canva', category: 'tool' },
    { name: 'Analyse de données', category: 'technical' },
  ],
  soft: [
    { name: 'Travail en équipe', category: 'soft' },
    { name: 'Leadership', category: 'soft' },
    { name: 'Communication', category: 'soft' },
    { name: 'Organisation', category: 'soft' },
    { name: 'Rigueur', category: 'soft' },
    { name: 'Adaptabilité', category: 'soft' },
    { name: 'Gestion du stress', category: 'soft' },
    { name: 'Autonomie', category: 'soft' },
    { name: 'Esprit d\'initiative', category: 'soft' },
    { name: 'Ponctualité', category: 'soft' },
    { name: 'Sens des responsabilités', category: 'soft' },
    { name: 'Orientation résultats', category: 'soft' },
  ],
}

export const LANGUAGE_LEVELS = [
  'Langue maternelle',
  'Courant (C2)',
  'Avancé (C1)',
  'Intermédiaire (B2)',
  'Intermédiaire (B1)',
  'Débutant (A2)',
  'Notions (A1)',
]
