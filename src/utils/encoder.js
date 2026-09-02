import LZString from 'lz-string';
import { defaultConfig, demoTemplates, mergeWithDefault } from '../data/defaultConfig';

const LOCAL_STORAGE_KEY = 'ganpati_invi_saved_clients';

/**
 * Compresses a configuration object into a URL-safe string
 */
export function encodeConfigToUrl(config) {
  try {
    const jsonStr = JSON.stringify(config);
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
 * Generates the full shareable URL for a config
 */
export function generateShareUrl(config, baseUrl = window.location.origin) {
  const encoded = encodeConfigToUrl(config);
  return `${baseUrl}/?d=${encoded}`;
}

/**
 * Generates a clean slug URL
 */
export function generateSlugUrl(slug, baseUrl = window.location.origin) {
  return `${baseUrl}/?c=${encodeURIComponent(slug)}`;
}

/**
 * Generates a pre-filled WhatsApp message
 */
export function generateWhatsAppMessage(config, shareUrl) {
  const familyName = config.familyNameInvite || `${config.familyName || ''} परिवाराकडून`;
  const sthapana = config.utsavSection?.tabs?.[0]?.value || '';

  return `॥ श्री गणेशाय नमः ॥\n\n*गणेशोत्सवाचे सस्नेह आमंत्रण*\n\nआमच्या घरी यावर्षी बाप्पाचे आगमन होत असून, ${familyName} आपणास व आपल्या परिवारास आग्रहाचे निमंत्रण!\n\n📅 स्थापना: ${sthapana}\n📍 स्थळ: ${config.locationSection?.address || ''}\n\nखालील लिंकवर क्लिक करून डिजिटल पत्रिका पहा व बाप्पाचे आशीर्वाद घ्या:\n👉 ${shareUrl}\n\n— ${config.finalSection?.familySignature || familyName}`;
}

/**
 * LocalStorage Helpers to manage multiple clients
 */
export function getSavedClients() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      // Seed with initial demo templates if empty
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoTemplates));
      return demoTemplates;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : demoTemplates;
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

    const existingIndex = clients.findIndex(c => c.clientSlug === slug || c.id === normalized.id);
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
  const clients = getSavedClients();
  return clients.find(c => c.clientSlug?.toLowerCase() === slug.toLowerCase() || c.id?.toLowerCase() === slug.toLowerCase()) || null;
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
