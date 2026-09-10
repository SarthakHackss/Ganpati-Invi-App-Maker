import LZString from 'lz-string';
import { defaultConfig, demoTemplates, mergeWithDefault } from '../data/defaultConfig';

const LOCAL_STORAGE_KEY = 'ganpati_invi_saved_clients';

/**
 * Extracts only fields that differ from default configuration to keep URLs tiny
 */
export function getDeltaConfig(customConfig) {
  if (!customConfig || typeof customConfig !== 'object') return {};
  const delta = {};

  for (const [key, value] of Object.entries(customConfig)) {
    if (value === undefined || value === null) continue;
    // Skip if identical to default
    if (JSON.stringify(value) === JSON.stringify(defaultConfig[key])) continue;
    delta[key] = value;
  }
  return delta;
}

/**
 * Compresses only delta configuration into a compact URL-safe string
 */
export function encodeConfigToUrl(config) {
  try {
    const delta = getDeltaConfig(config);
    const jsonStr = JSON.stringify(delta);
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (err) {
    console.error('Failed to encode config to URL:', err);
    return '';
  }
}

/**
 * Decompresses a URL query string back into a configuration object
 */
export function decodeConfigFromUrl(encodedStr) {
  if (!encodedStr) return null;
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedStr);
    if (!decompressed) return null;
    const parsed = JSON.parse(decompressed);
    return mergeWithDefault(parsed);
  } catch (err) {
    console.error('Failed to decode config from URL:', err);
    return null;
  }
}

/**
 * Generates a clean short slug URL: e.g. https://ganpatiinvi.sarthakpatil.social/?c=ajit
 */
export function generateSlugUrl(slug, baseUrl) {
  const cleanSlug = (slug || 'client').trim().toLowerCase();
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://ganpatiinvi.sarthakpatil.social');
  return `${origin}/?c=${encodeURIComponent(cleanSlug)}`;
}

/**
 * Generates a custom subdomain URL: e.g. https://ajit.sarthakpatil.social
 */
export function generateSubdomainUrl(slug) {
  const cleanSlug = (slug || 'client').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  return `https://${cleanSlug}.sarthakpatil.social`;
}

/**
 * Generates the best primary share URL for a client (preferring clean short URLs)
 */
export function generateShareUrl(config, baseUrl) {
  const slug = (config.clientSlug || config.id || '').trim();
  if (slug) {
    return generateSlugUrl(slug, baseUrl);
  }
  const encoded = encodeConfigToUrl(config);
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://ganpatiinvi.sarthakpatil.social');
  return `${origin}/?d=${encoded}`;
}

/**
 * Generates a pre-filled WhatsApp message
 */
export function generateWhatsAppMessage(config, shareUrl) {
  const familyName = config.familyNameInvite || `${config.familyName || ''} परिवाराकडून`;
  const sthapana = config.utsavSection?.tabs?.[0]?.value || '';
  const url = shareUrl || generateShareUrl(config);

  return `॥ श्री गणेशाय नमः ॥\n\n*गणेशोत्सवाचे सस्नेह आमंत्रण*\n\nआमच्या घरी यावर्षी बाप्पाचे आगमन होत असून, ${familyName} आपणास व आपल्या परिवारास आग्रहाचे निमंत्रण!\n\n📅 स्थापना: ${sthapana}\n📍 स्थळ: ${config.locationSection?.address || ''}\n\nखालील लिंकवर क्लिक करून डिजिटल पत्रिका पहा व बाप्पाचे आशीर्वाद घ्या:\n👉 ${url}\n\n— ${config.finalSection?.familySignature || familyName}`;
}

/**
 * LocalStorage Helpers to manage multiple clients
 */
export function getSavedClients() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    const clientList = Array.isArray(parsed) ? parsed : [];

    // Ensure all built-in templates (like ajitpatil, deshmukh, patil) are always present
    const combined = [...clientList];
    for (const t of demoTemplates) {
      const idx = combined.findIndex(c => 
        (c.clientSlug && c.clientSlug.toLowerCase() === t.clientSlug.toLowerCase()) || 
        (c.id && c.id.toLowerCase() === t.id.toLowerCase())
      );
      if (idx === -1) {
        combined.push(t);
      }
    }

    return combined;
  } catch (err) {
    console.error('Error reading saved clients from localStorage:', err);
    return demoTemplates;
  }
}

export function saveClientToStorage(clientConfig) {
  try {
    const clients = getSavedClients();
    const slug = clientConfig.clientSlug || clientConfig.id || `client-${Date.now()}`;
    const normalized = {
      ...clientConfig,
      id: slug,
      clientSlug: slug,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = clients.findIndex(c => 
      (c.clientSlug && c.clientSlug.toLowerCase() === slug.toLowerCase()) || 
      (c.id && c.id.toLowerCase() === slug.toLowerCase())
    );

    let updatedClients;
    if (existingIndex >= 0) {
      updatedClients = [...clients];
      updatedClients[existingIndex] = normalized;
    } else {
      updatedClients = [normalized, ...clients];
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedClients));
    return updatedClients;
  } catch (err) {
    console.error('Error saving client to localStorage:', err);
    return [];
  }
}

export function deleteClientFromStorage(clientId) {
  try {
    const clients = getSavedClients();
    const filtered = clients.filter(c => c.id !== clientId && c.clientSlug !== clientId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Error deleting client from localStorage:', err);
    return [];
  }
}

export function findClientBySlug(slug) {
  if (!slug) return null;
  const clean = slug.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const clients = getSavedClients();
  return clients.find(c => {
    const cSlug = (c.clientSlug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cId = (c.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const aliases = (c.aliases || []).map(a => String(a).toLowerCase().replace(/[^a-z0-9]/g, ''));
    return cSlug === clean || cId === clean || aliases.includes(clean);
  }) || null;
}

/**
 * Trigger file download for JSON export
 */
export function downloadJsonFile(filename, data) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
