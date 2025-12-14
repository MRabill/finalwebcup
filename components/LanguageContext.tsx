"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "fr" | "pt";

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    upcomingCharacter: "Upcoming Character",
    renderOnCyberspace: "Render on CYBERSPACE",
    rank: "Rank",
    class: "Class",
    risk: "Risk",
    status: "Status",
    active: "Active",
    vibe: "Vibe",
    skill: "Skill",
    riskLevel: "Risk Level",
    archetype: "Archetype",
    lookingFor: "Looking For",
    energy: "Energy",
    systemStatus: "System Status",
    ageBuilt: "Age / Built",
    riskTolerance: "Risk Tolerance",
    mood: "Mood",
    openChat: "Open Chat with",
    terminateLink: "TERMINATE LINK?",
    terminateWarning: "WARNING: NEURAL SYNC WILL BE SEVERED.\nUNSAVED DATA FRAGMENTS MAY BE LOST.",
    cancel: "CANCEL",
    confirm: "CONFIRM",
    aborting: "ABORTING...",
    logout: "LOGOUT",
    system: "SYSTEM",
    targetAcquired: "TARGET_ACQUIRED",
    locked: "LOCKED",
    encryptionLevel: "ENCRYPTION_LEVEL",
    dataStreamIncoming: "DATA_STREAM_INCOMING",
    unauthorizedSignal: "UNAUTHORIZED SIGNAL DETECTED IN SECTOR 7G. SECURITY PROTOCOLS ENGAGED.",
    zenless: "ZENLESS",
    zoneZero: "ZONE ZERO",
    prime: "Prime",
    online: "online",
    close: "close",
    quantumCognition: "quantum cognition chat console",
    noTransmissions: "// NO TRANSMISSIONS YET",
    typePrompt: "type your first prompt below to link with the astra - λ mesh",
    processing: "processing quantum stream",
    inputPlaceholder: "Type a prompt to ping the ASTRA - Λ core...",
    voiceEnabled: "Voice output enabled",
    voiceDisabled: "Voice output disabled",
    transmit: "Transmit",
    purgeLog: "Purge log",
    astraError: "// ASTRA-Λ SYSTEM ERROR: Failed to process request.",
    astraLost: "// ASTRA-Λ SYSTEM: Signal lost. Please try again.",
  },
  fr: {
    upcomingCharacter: "Personnage à venir",
    renderOnCyberspace: "Rendu sur CYBERSPACE",
    rank: "Rang",
    class: "Classe",
    risk: "Risque",
    status: "Statut",
    active: "Actif",
    vibe: "Ambiance",
    skill: "Compétence",
    riskLevel: "Niveau de risque",
    archetype: "Archétype",
    lookingFor: "Recherche",
    energy: "Énergie",
    systemStatus: "État du système",
    ageBuilt: "Âge / Construit",
    riskTolerance: "Tolérance au risque",
    mood: "Humeur",
    openChat: "Ouvrir le chat avec",
    terminateLink: "TERMINER LA LIAISON ?",
    terminateWarning: "ATTENTION : LA SYNCHRONISATION NEURALE SERA INTERROMPUE.\nDES FRAGMENTS DE DONNÉES NON SAUVEGARDÉS PEUVENT ÊTRE PERDUS.",
    cancel: "ANNULER",
    confirm: "CONFIRMER",
    aborting: "ANNULATION...",
    logout: "DÉCONNEXION",
    system: "SYSTÈME",
    targetAcquired: "CIBLE_ACQUISE",
    locked: "VERROUILLÉ",
    encryptionLevel: "NIVEAU_DE_CHIFFREMENT",
    dataStreamIncoming: "FLUX_DE_DONNÉES_ENTRANT",
    unauthorizedSignal: "SIGNAL NON AUTORISÉ DÉTECTÉ DANS LE SECTEUR 7G. PROTOCOLES DE SÉCURITÉ ENGAGÉS.",
    zenless: "ZENLESS",
    zoneZero: "ZONE ZÉRO",
    prime: "Prime",
    online: "en ligne",
    close: "fermer",
    quantumCognition: "console de chat cognition quantique",
    noTransmissions: "// AUCUNE TRANSMISSION",
    typePrompt: "tapez votre première commande ci-dessous pour lier avec le maillage astra - λ",
    processing: "traitement du flux quantique",
    inputPlaceholder: "Tapez une commande pour pinger le noyau ASTRA - Λ...",
    voiceEnabled: "Sortie vocale activée",
    voiceDisabled: "Sortie vocale désactivée",
    transmit: "Transmettre",
    purgeLog: "Purger le journal",
    astraError: "// ERREUR SYSTÈME ASTRA-Λ : Échec du traitement de la demande.",
    astraLost: "// SYSTÈME ASTRA-Λ : Signal perdu. Veuillez réessayer.",
  },
  pt: {
    upcomingCharacter: "Próximo Personagem",
    renderOnCyberspace: "Renderizar no CYBERSPACE",
    rank: "Classificação",
    class: "Classe",
    risk: "Risco",
    status: "Status",
    active: "Ativo",
    vibe: "Vibe",
    skill: "Habilidade",
    riskLevel: "Nível de Risco",
    archetype: "Arquétipo",
    lookingFor: "Procurando por",
    energy: "Energia",
    systemStatus: "Status do Sistema",
    ageBuilt: "Idade / Construído",
    riskTolerance: "Tolerância ao Risco",
    mood: "Humor",
    openChat: "Abrir Chat com",
    terminateLink: "TERMINAR LINK?",
    terminateWarning: "AVISO: A SINCRONIZAÇÃO NEURAL SERÁ CORTADA.\nFRAGMENTOS DE DADOS NÃO SALVOS PODEM SER PERDIDOS.",
    cancel: "CANCELAR",
    confirm: "CONFIRMAR",
    aborting: "ABORTANDO...",
    logout: "SAIR",
    system: "SISTEMA",
    targetAcquired: "ALVO_ADQUIRIDO",
    locked: "BLOQUEADO",
    encryptionLevel: "NÍVEL_DE_CRIPTOGRAFIA",
    dataStreamIncoming: "FLUXO_DE_DADOS_ENTRANDO",
    unauthorizedSignal: "SINAL NÃO AUTORIZADO DETECTADO NO SETOR 7G. PROTOCOLOS DE SEGURANÇA ATIVADOS.",
    zenless: "ZENLESS",
    zoneZero: "ZONE ZERO",
    prime: "Prime",
    online: "online",
    close: "fechar",
    quantumCognition: "console de chat de cognição quântica",
    noTransmissions: "// SEM TRANSMISSÕES AINDA",
    typePrompt: "digite seu primeiro prompt abaixo para conectar com a malha astra - λ",
    processing: "processando fluxo quântico",
    inputPlaceholder: "Digite um prompt para pingar o núcleo ASTRA - Λ...",
    voiceEnabled: "Saída de voz ativada",
    voiceDisabled: "Saída de voz desativada",
    transmit: "Transmitir",
    purgeLog: "Limpar log",
    astraError: "// ERRO DO SISTEMA ASTRA-Λ: Falha ao processar solicitação.",
    astraLost: "// SISTEMA ASTRA-Λ: Sinal perdido. Por favor tente novamente.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("en");

  // Load language from local storage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("app_language") as Language;
    if (savedLang && ["en", "fr", "pt"].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app_language", lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

