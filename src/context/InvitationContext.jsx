import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { defaultConfig, mergeWithDefault } from '../data/defaultConfig';
import { themePalettes } from '../data/themes';
import { decodeConfigFromUrl, findClientBySlug } from '../utils/encoder';

const ADMIN_AUTH_KEY = 'ganpati_admin_authorized';
export const ADMIN_DEFAULT_PIN = '1963'; // Sarthak's pin (also accepts 'admin' or 'bappa')

const InvitationContext = createContext(null);

export function InvitationProvider({ children }) {
  // Check if current user is owner/admin
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === 'undefined') return false;
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    // Explicit admin triggers in URL
    if (
      searchParams.has('admin') || 
      searchParams.has('builder') || 
      hash === '#admin' || 
      hash === '#builder'
    ) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      return true;
    }

    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });

  const [isBuilderOpen, setIsBuilderOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const urlHasAdmin = searchParams.has('builder') || searchParams.has('admin') || hash === '#builder' || hash === '#admin';
      return urlHasAdmin;
    }
    return false;
  });

  const [isPinPromptOpen, setIsPinPromptOpen] = useState(false);

  const [config, setConfig] = useState(() => {
    // 1. Check for URL payload ?d=...
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const dataParam = searchParams.get('d') || searchParams.get('data');
      if (dataParam) {
        const decoded = decodeConfigFromUrl(dataParam);
        if (decoded) return decoded;
      }

      // 2. Check for slug ?c=... or ?client=...
      const clientSlug = searchParams.get('c') || searchParams.get('client');
      if (clientSlug) {
        const matched = findClientBySlug(clientSlug);
        if (matched) return mergeWithDefault(matched);
      }

      // 3. Check for subdomain (e.g. patil.yourdomain.com)
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length >= 3 && parts[0] !== 'www' && parts[0] !== 'localhost') {
        const subSlug = parts[0];
        const matched = findClientBySlug(subSlug);
        if (matched) return mergeWithDefault(matched);
      }
    }

    return { ...defaultConfig };
  });

  // Apply CSS variables dynamically whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    const themeKey = config.theme || 'deepPlum';
    const themeColors = themePalettes[themeKey] || themePalettes.deepPlum || themePalettes.royalBlue;

    root.style.setProperty('--color-bg-primary', themeColors.primaryBg);
    root.style.setProperty('--color-bg-secondary', themeColors.secondaryBg);
    root.style.setProperty('--color-bg-dark', themeColors.bgDark);
    root.style.setProperty('--color-gold-primary', themeColors.gold);
    root.style.setProperty('--color-gold-muted', themeColors.goldMuted);
    root.style.setProperty('--color-text-primary', themeColors.cream);
    root.style.setProperty('--color-text-secondary', themeColors.creamMuted);
    root.style.setProperty('--gradient-hero', themeColors.gradientHero);
    root.style.setProperty('--glow-1', themeColors.glow1);
    root.style.setProperty('--glow-2', themeColors.glow2);
    root.style.setProperty('--card-bg', themeColors.cardBg);
    root.style.setProperty('--card-border', themeColors.cardBorder);
    root.style.setProperty('--card-glow', themeColors.cardGlow);
    root.style.setProperty('--card-image-bg', themeColors.cardImageBg);
    root.style.setProperty('--card-image-glow', themeColors.cardImageGlow);
    root.style.setProperty('--dot-bg', themeColors.dotBg);
    root.style.setProperty('--dot-active-bg', themeColors.dotActiveBg);
    root.style.setProperty('--music-toggle-bg', themeColors.musicToggleBg);
    root.style.setProperty('--music-toggle-active-bg', themeColors.musicToggleActiveBg);
    root.style.setProperty('--music-toggle-active-shadow', themeColors.musicToggleActiveShadow);
    root.style.setProperty('--utsav-tab-bg', themeColors.utsavTabBg);
    root.style.setProperty('--utsav-tab-border', themeColors.utsavTabBorder);
    root.style.setProperty('--utsav-note-bg', themeColors.utsavNoteBg);
    root.style.setProperty('--utsav-note-border', themeColors.utsavNoteBorder);
    root.style.setProperty('--map-card-bg', themeColors.mapCardBg);
    root.style.setProperty('--map-card-border', themeColors.mapCardBorder);
    root.style.setProperty('--map-overlay', themeColors.mapOverlay);
    root.style.setProperty('--blessing-card-bg', themeColors.blessingCardBg);
    root.style.setProperty('--blessing-card-border', themeColors.blessingCardBorder);
    root.style.setProperty('--blessing-card-glow', themeColors.blessingCardGlow);
    root.style.setProperty('--gallery-item-bg', themeColors.galleryItemBg);
    root.style.setProperty('--gallery-item-border', themeColors.galleryItemBorder);
    root.style.setProperty('--gallery-overlay', themeColors.galleryOverlay);
    root.style.setProperty('--final-glow', themeColors.finalGlow);
  }, [config.theme]);

  // Update Page Title and Meta description
  useEffect(() => {
    if (config.meta?.title) {
      document.title = config.meta.title;
    }
  }, [config.meta?.title]);

  // Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A) to trigger admin studio
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdmin) {
          setIsBuilderOpen(prev => !prev);
        } else {
          setIsPinPromptOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

  const authenticateAdmin = useCallback((pin) => {
    if (pin === ADMIN_DEFAULT_PIN || pin === 'admin' || pin === 'bappa') {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setIsAdmin(true);
      setIsBuilderOpen(true);
      setIsPinPromptOpen(false);
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAdmin(false);
    setIsBuilderOpen(false);
  }, []);

  const setTheme = useCallback((themeId) => {
    if (!themePalettes[themeId]) return;
    setConfig(prev => ({ ...prev, theme: themeId }));
  }, []);

  const updateConfigField = useCallback((path, value) => {
    setConfig(prev => {
      const keys = path.split('.');
      if (keys.length === 1) {
        return { ...prev, [keys[0]]: value };
      }
      if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value
          }
        };
      }
      if (keys.length === 3) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: {
              ...prev[keys[0]]?.[keys[1]],
              [keys[2]]: value
            }
          }
        };
      }
      return prev;
    });
  }, []);

  const loadClient = useCallback((clientConfig) => {
    setConfig(mergeWithDefault(clientConfig));
  }, []);

  const resetToDefault = useCallback(() => {
    setConfig({ ...defaultConfig });
  }, []);

  const contextValue = useMemo(() => ({
    config,
    setConfig,
    setTheme,
    updateConfigField,
    loadClient,
    resetToDefault,
    isAdmin,
    setIsAdmin,
    isBuilderOpen,
    setIsBuilderOpen,
    isPinPromptOpen,
    setIsPinPromptOpen,
    authenticateAdmin,
    logoutAdmin
  }), [
    config, 
    isAdmin, 
    isBuilderOpen, 
    isPinPromptOpen, 
    setTheme, 
    updateConfigField, 
    loadClient, 
    resetToDefault, 
    authenticateAdmin, 
    logoutAdmin
  ]);

  return (
    <InvitationContext.Provider value={contextValue}>
      {children}
    </InvitationContext.Provider>
  );
}

export function useInvitation() {
  const context = useContext(InvitationContext);
  if (!context) {
    throw new Error('useInvitation must be used within an InvitationProvider');
  }
  return context;
}
