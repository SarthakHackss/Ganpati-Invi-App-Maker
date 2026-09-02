import { useState, useEffect, useRef } from 'react';
import { useInvitation } from '../../context/InvitationContext';
import { themePalettes } from '../../data/themes';
import { 
  generateShareUrl, 
  generateWhatsAppMessage, 
  getSavedClients, 
  saveClientToStorage, 
  deleteClientFromStorage, 
  downloadJsonFile 
} from '../../utils/encoder';
import './builder.css';

export default function BuilderStudio() {
  const { 
    config, 
    setConfig, 
    setTheme, 
    updateConfigField, 
    loadClient, 
    resetToDefault, 
    isAdmin,
    isBuilderOpen, 
    setIsBuilderOpen,
    isPinPromptOpen,
    setIsPinPromptOpen,
    authenticateAdmin,
    logoutAdmin
  } = useInvitation();

  const [activeTab, setActiveTab] = useState('themes');
  const [toastMessage, setToastMessage] = useState('');
  const [savedClients, setSavedClients] = useState([]);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const fileInputRef = useRef(null);

  // Reload saved clients from localStorage
  const refreshSavedClients = () => {
    setSavedClients(getSavedClients());
  };

  useEffect(() => {
    refreshSavedClients();
  }, [isBuilderOpen]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // 1. Copy WhatsApp Link & Message
  const handleCopyWhatsApp = async () => {
    const shareUrl = generateShareUrl(config);
    const message = generateWhatsAppMessage(config, shareUrl);

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        showToast('✅ WhatsApp आमंत्रण संदेश व लिंक कॉपी झाली!');
      } else {
        showToast(`लिंक: ${shareUrl}`);
      }
    } catch (err) {
      console.error(err);
      showToast('लिंक कॉपी करण्यात अडचण आली.');
    }
  };

  // 2. Copy Direct URL Only
  const handleCopyDirectUrl = async () => {
    const shareUrl = generateShareUrl(config);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('🔗 शेअर करण्यायोग्य डिजिटल लिंक कॉपी झाली!');
      }
    } catch (err) {
      showToast(shareUrl);
    }
  };

  // 3. Save Client to Storage
  const handleSaveClient = () => {
    const slug = config.clientSlug || (config.familyName ? config.familyName.trim().toLowerCase().replace(/\s+/g, '-') : 'client');
    const toSave = { ...config, clientSlug: slug, id: slug };
    saveClientToStorage(toSave);
    refreshSavedClients();
    showToast(`💾 "${config.familyName || 'क्लायंट'}" सेव्ह करण्यात आले!`);
  };

  // 4. Download JSON config
  const handleExportJson = () => {
    const filename = `${config.clientSlug || config.familyName || 'ganpati-invite'}.json`;
    downloadJsonFile(filename, config);
    showToast(`📥 ${filename} डाऊनलोड सुरू झाली!`);
  };

  // 5. Import JSON config
  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        loadClient(parsed);
        showToast('📤 क्लायंट कॉन्फिगरेशन यशस्वीरित्या लोड झाले!');
      } catch (err) {
        showToast('❌ अवैध JSON फाईल.');
      }
    };
    reader.readAsText(file);
  };

  // 6. Family Member Management
  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...(config.familySection?.members || [])];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    updateConfigField('familySection.members', updatedMembers);
  };

  const handleAddMember = () => {
    const updatedMembers = [
      ...(config.familySection?.members || []),
      { name: 'नवीन सदस्य', relation: 'नातं', image: '/assets/family-1.png' }
    ];
    updateConfigField('familySection.members', updatedMembers);
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = (config.familySection?.members || []).filter((_, i) => i !== index);
    updateConfigField('familySection.members', updatedMembers);
  };

  // Image Upload helper converting to Base64
  const handleImageUpload = (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 1.5MB recommended for URL stability)
    if (file.size > 1.5 * 1024 * 1024) {
      showToast('⚠️ फोटो साईझ १.५ MB पेक्षा कमी असावी.');
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      callback(ev.target.result);
      showToast('📸 फोटो अपडेट झाला!');
    };
    reader.readAsDataURL(file);
  };

  // Aarti timing item change
  const handleAartiChange = (index, val) => {
    const updated = [...(config.utsavSection?.tabs?.[1]?.values || [])];
    updated[index] = val;
    const newTabs = [...(config.utsavSection?.tabs || [])];
    newTabs[1] = { ...newTabs[1], values: updated };
    updateConfigField('utsavSection.tabs', newTabs);
  };

  const handleAddAarti = () => {
    const current = config.utsavSection?.tabs?.[1]?.values || [];
    const updated = [...current, 'दुपारी १२:००'];
    const newTabs = [...(config.utsavSection?.tabs || [])];
    newTabs[1] = { ...newTabs[1], values: updated };
    updateConfigField('utsavSection.tabs', newTabs);
  };

  const handleRemoveAarti = (index) => {
    const current = config.utsavSection?.tabs?.[1]?.values || [];
    const updated = current.filter((_, i) => i !== index);
    const newTabs = [...(config.utsavSection?.tabs || [])];
    newTabs[1] = { ...newTabs[1], values: updated };
    updateConfigField('utsavSection.tabs', newTabs);
  };

  return (
    <>
      {/* 1. Owner PIN Verification Modal */}
      {isPinPromptOpen && (
        <div className="builder-overlay" onClick={() => setIsPinPromptOpen(false)}>
          <div className="builder-pin-modal" onClick={e => e.stopPropagation()}>
            <div className="builder-pin-icon">🔐</div>
            <h3>आमंत्रण स्टुडिओ (Owner Access)</h3>
            <p>हा स्टुडिओ केवळ आपल्यासाठी (Admin) आहे. ग्राहकांना ही स्क्रीन किंवा बटण दिसणार नाही.</p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const ok = authenticateAdmin(pinInput);
              if (!ok) {
                setPinError('चुकीचा पिन! (डिफॉल्ट पिन: 1963)');
              } else {
                setPinInput('');
                setPinError('');
                showToast('✅ ॲडमिन मोड सुरू झाला!');
              }
            }}>
              <input
                type="password"
                className="builder-input"
                placeholder="पिन टाका (उदा. 1963)"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                autoFocus
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em' }}
              />
              {pinError && <p className="builder-pin-error">{pinError}</p>}

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="submit" className="builder-btn builder-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  लॉगिन करा
                </button>
                <button 
                  type="button" 
                  className="builder-btn builder-btn-secondary" 
                  onClick={() => setIsPinPromptOpen(false)}
                >
                  रद्द करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Floating Trigger Button: ONLY VISIBLE TO THE OWNER (isAdmin) */}
      {isAdmin && !isBuilderOpen && (
        <button
          className="builder-trigger-btn"
          onClick={() => setIsBuilderOpen(true)}
          title="Open Invitation Studio"
          aria-label="Open Invitation Studio"
        >
          <span>✨</span>
          <span>आमंत्रण स्टुडिओ (Builder)</span>
          <span className="builder-trigger-badge">ADMIN</span>
        </button>
      )}

      {/* 3. Main Studio Modal */}
      {isBuilderOpen && (
        <div className="builder-overlay" onClick={() => setIsBuilderOpen(false)}>
          <div className="builder-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="builder-header">
              <div className="builder-title-wrap">
                <span className="builder-logo-om">ॐ</span>
                <div className="builder-title-text">
                  <h2>गणपती आमंत्रण स्टुडिओ (Invitation Builder)</h2>
                  <p>क्लायंट: <strong>{config.familyName || 'नवीन'}</strong> ({themePalettes[config.theme]?.name || config.theme})</p>
                </div>
              </div>

              <div className="builder-header-actions">
                <button 
                  className="builder-btn builder-btn-primary" 
                  onClick={handleCopyWhatsApp}
                  title="Copy ready-to-send WhatsApp invitation message with link"
                >
                  <span>📱</span> WhatsApp लिंक कॉपी
                </button>

                <button 
                  className="builder-btn builder-btn-secondary" 
                  onClick={handleCopyDirectUrl}
                  title="Copy direct shareable web URL"
                >
                  <span>🔗</span> लिंक
                </button>

                <button 
                  className="builder-btn builder-btn-secondary" 
                  onClick={handleSaveClient}
                  title="Save client to browser storage"
                >
                  <span>💾</span> सेव्ह करा
                </button>

                <button 
                  className="builder-btn builder-btn-secondary" 
                  onClick={handleExportJson}
                  title="Download configuration JSON file"
                >
                  <span>📥</span> JSON
                </button>

                <button 
                  className="builder-btn builder-btn-secondary" 
                  onClick={() => {
                    logoutAdmin();
                    showToast('🔒 ॲडमिन मोड बंद झाला (क्लायंट व्ह्यू सुरू).');
                  }}
                  title="Lock & Hide Builder to preview client experience"
                  style={{ color: '#ffb3b3', borderColor: 'rgba(255,100,100,0.3)' }}
                >
                  <span>🔒</span> Client View
                </button>

                <button 
                  className="builder-btn-close" 
                  onClick={() => setIsBuilderOpen(false)}
                  title="Close Studio & Preview Invitation"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="builder-tabs">
              <button 
                className={`builder-tab ${activeTab === 'themes' ? 'active' : ''}`}
                onClick={() => setActiveTab('themes')}
              >
                <span>🎨</span> राजेशाही थीम्स (12 Themes)
              </button>

              <button 
                className={`builder-tab ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <span>🕉️</span> कुटुंब व शीर्षक (Family)
              </button>

              <button 
                className={`builder-tab ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                <span>📅</span> स्थापना व आरती (Dates)
              </button>

              <button 
                className={`builder-tab ${activeTab === 'location' ? 'active' : ''}`}
                onClick={() => setActiveTab('location')}
              >
                <span>📍</span> पत्ता व गुगल मॅप (Venue)
              </button>

              <button 
                className={`builder-tab ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => setActiveTab('members')}
              >
                <span>👥</span> कुटुंब सदस्य ({config.familySection?.members?.length || 0})
              </button>

              <button 
                className={`builder-tab ${activeTab === 'gallery' ? 'active' : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                <span>🖼️</span> गॅलरी व संगीत (Media)
              </button>

              <button 
                className={`builder-tab ${activeTab === 'clients' ? 'active' : ''}`}
                onClick={() => setActiveTab('clients')}
              >
                <span>📁</span> सेव्ह केलेले क्लायंट्स ({savedClients.length})
              </button>
            </div>

            {/* Studio Body Content */}
            <div className="builder-body">
              {/* TAB 1: THEMES */}
              {activeTab === 'themes' && (
                <div>
                  <div className="builder-notice">
                    <span>✨ <strong>१२ भव्य राजेशाही कलर्स:</strong> कोणत्याही एका थीमवर क्लिक करा. संपूर्ण आमंत्रणाचा रंग, बॅकग्राऊंड आणि कर्टन क्षणात बदलेल!</span>
                  </div>

                  <div className="themes-grid">
                    {Object.values(themePalettes).map((th) => {
                      const isSelected = config.theme === th.id;
                      return (
                        <div
                          key={th.id}
                          className={`theme-card ${isSelected ? 'selected' : ''}`}
                          style={{
                            background: `linear-gradient(145deg, ${th.secondaryBg}, ${th.primaryBg})`,
                            borderColor: isSelected ? th.gold : 'rgba(212, 166, 74, 0.15)'
                          }}
                          onClick={() => {
                            setTheme(th.id);
                            showToast(`🎨 थीम लागू झाली: ${th.name}`);
                          }}
                        >
                          {isSelected && <span className="theme-active-tag">सक्रिय (Active)</span>}

                          <div className="theme-card-preview" style={{ background: th.primaryBg }}>
                            <span className="theme-swatch" style={{ background: th.gold }} title="Gold Accent" />
                            <span className="theme-swatch" style={{ background: th.primaryBg, border: '1px solid #d4a64a' }} title="Primary" />
                            <span className="theme-swatch" style={{ background: th.secondaryBg }} title="Secondary" />
                          </div>

                          <div className="theme-card-info">
                            <h4 style={{ color: isSelected ? th.gold : '#f5e9d0' }}>{th.name}</h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: FAMILY & INTRO */}
              {activeTab === 'info' && (
                <div className="builder-form-grid">
                  <div className="builder-field-group">
                    <label className="builder-label">आडनाव / कुटुंब नाव (Family Surname)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.familyName || ''}
                      onChange={(e) => updateConfigField('familyName', e.target.value)}
                      placeholder="उदा. पाटील"
                    />
                  </div>

                  <div className="builder-field-group">
                    <label className="builder-label">क्लायंट कोड / Slug (Client Slug)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.clientSlug || ''}
                      onChange={(e) => updateConfigField('clientSlug', e.target.value)}
                      placeholder="उदा. patil"
                    />
                  </div>

                  <div className="builder-field-group">
                    <label className="builder-label">निमंत्रक स्वाक्षरी (Invited by Signature)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.familyNameInvite || ''}
                      onChange={(e) => updateConfigField('familyNameInvite', e.target.value)}
                      placeholder="उदा. पाटील परिवाराकडून"
                    />
                  </div>

                  <div className="builder-field-group">
                    <label className="builder-label">प्रारंभिक ओळ (Hero Intro Line)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.heroIntroLine || ''}
                      onChange={(e) => updateConfigField('heroIntroLine', e.target.value)}
                      placeholder="उदा. आमच्या घरी यावर्षी"
                    />
                  </div>

                  <div className="builder-field-group">
                    <label className="builder-label">वेबसाईट शीर्षक (Browser Tab Title)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.meta?.title || ''}
                      onChange={(e) => updateConfigField('meta.title', e.target.value)}
                      placeholder="उदा. पाटील गणेश उत्सव"
                    />
                  </div>

                  <div className="builder-field-group">
                    <label className="builder-label">अंतिम स्वाक्षरी (Final Signature)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.finalSection?.familySignature || ''}
                      onChange={(e) => updateConfigField('finalSection.familySignature', e.target.value)}
                      placeholder="उदा. — पाटील परिवार"
                    />
                  </div>

                  <div className="builder-field-group builder-full-width">
                    <label className="builder-label">कुटुंब स्वागत संदेश (Family Welcome Message)</label>
                    <textarea 
                      className="builder-textarea"
                      value={config.familySection?.text || ''}
                      onChange={(e) => updateConfigField('familySection.text', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="builder-field-group builder-full-width">
                    <label className="builder-label">अंतिम आभार संदेश (Final Farewell Message)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.finalSection?.message?.[0] || ''}
                      onChange={(e) => {
                        const current = [...(config.finalSection?.message || ['आपली उपस्थिती हेच आमच्यासाठी', 'बाप्पाचे आशीर्वाद आहेत.'])];
                        current[0] = e.target.value;
                        updateConfigField('finalSection.message', current);
                      }}
                      placeholder="ओळ १: आपली उपस्थिती हेच आमच्यासाठी"
                      style={{ marginBottom: '8px' }}
                    />
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.finalSection?.message?.[1] || ''}
                      onChange={(e) => {
                        const current = [...(config.finalSection?.message || ['आपली उपस्थिती हेच आमच्यासाठी', 'बाप्पाचे आशीर्वाद आहेत.'])];
                        current[1] = e.target.value;
                        updateConfigField('finalSection.message', current);
                      }}
                      placeholder="ओळ २: बाप्पाचे आशीर्वाद आहेत."
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: SCHEDULE & AARTI */}
              {activeTab === 'schedule' && (
                <div className="builder-form-grid">
                  <div className="builder-field-group">
                    <label className="builder-label">स्थापना तारीख (Sthapana Date)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.utsavSection?.tabs?.[0]?.value || ''}
                      onChange={(e) => {
                        const newTabs = [...(config.utsavSection?.tabs || [])];
                        newTabs[0] = { ...newTabs[0], value: e.target.value };
                        updateConfigField('utsavSection.tabs', newTabs);
                      }}
                      placeholder="उदा. १४ सप्टेंबर २०२६"
                    />
                  </div>

                  <div className="builder-field-group">
                    <label className="builder-label">आरती वेळा (Aarti Timings)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(config.utsavSection?.tabs?.[1]?.values || []).map((val, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text"
                            className="builder-input"
                            value={val}
                            onChange={(e) => handleAartiChange(idx, e.target.value)}
                            placeholder="उदा. सकाळी ८:००"
                          />
                          <button 
                            type="button"
                            className="builder-btn builder-btn-secondary"
                            onClick={() => handleRemoveAarti(idx)}
                            title="काढून टाका"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button" 
                        className="builder-btn builder-btn-secondary"
                        onClick={handleAddAarti}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        + आरती वेळ जोडा
                      </button>
                    </div>
                  </div>

                  <div className="builder-field-group builder-full-width">
                    <label className="builder-label">उत्सव मुक्काम नोंद (Event Duration Note)</label>
                    <textarea 
                      className="builder-textarea"
                      value={config.utsavSection?.note?.[0] || ''}
                      onChange={(e) => {
                        const newNotes = [...(config.utsavSection?.note || ['', ''])];
                        newNotes[0] = e.target.value;
                        updateConfigField('utsavSection.note', newNotes);
                      }}
                      rows={2}
                    />
                  </div>

                  <div className="builder-field-group builder-full-width">
                    <label className="builder-label">निमंत्रण नम्र विनंती (Welcome Request Note)</label>
                    <textarea 
                      className="builder-textarea"
                      value={config.utsavSection?.note?.[1] || ''}
                      onChange={(e) => {
                        const newNotes = [...(config.utsavSection?.note || ['', ''])];
                        newNotes[1] = e.target.value;
                        updateConfigField('utsavSection.note', newNotes);
                      }}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: LOCATION & VENUE */}
              {activeTab === 'location' && (
                <div className="builder-form-grid">
                  <div className="builder-field-group">
                    <label className="builder-label">घराचे / ठिकाणाचे नाव (Residence / Venue Name)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.locationSection?.address || ''}
                      onChange={(e) => updateConfigField('locationSection.address', e.target.value)}
                      placeholder="उदा. पाटील निवास"
                    />
                  </div>

                  <div className="builder-field-group">
                    <label className="builder-label">दर्शनाची सूचना (Visiting Note)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.locationSection?.note || ''}
                      onChange={(e) => updateConfigField('locationSection.note', e.target.value)}
                      placeholder="उदा. बाप्पाच्या दर्शनासाठी अवश्य या"
                    />
                  </div>

                  <div className="builder-field-group builder-full-width">
                    <label className="builder-label">संपूर्ण पत्ता (Full Address)</label>
                    <textarea 
                      className="builder-textarea"
                      value={config.locationSection?.fullAddress || ''}
                      onChange={(e) => updateConfigField('locationSection.fullAddress', e.target.value)}
                      rows={2}
                      placeholder="उदा. प्लॉट नं. १२, गणेशनगर, अलिबाग, रायगड, महाराष्ट्र"
                    />
                  </div>

                  <div className="builder-field-group builder-full-width">
                    <label className="builder-label">Google Maps नेव्हिगेशन लिंक (Google Maps Link)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.locationSection?.mapsLink || ''}
                      onChange={(e) => updateConfigField('locationSection.mapsLink', e.target.value)}
                      placeholder="उदा. https://maps.app.goo.gl/..."
                    />
                  </div>

                  <div className="builder-field-group builder-full-width">
                    <label className="builder-label">Google Maps Embed Iframe URL</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.locationSection?.mapEmbed || ''}
                      onChange={(e) => updateConfigField('locationSection.mapEmbed', e.target.value)}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: FAMILY MEMBERS */}
              {activeTab === 'members' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <p style={{ margin: 0, color: '#c9baa1', fontSize: '0.9rem' }}>
                      प्रत्येक सदस्याचे नाव, नाते आणि फोटो जोडा किंवा बदला.
                    </p>
                    <button 
                      type="button" 
                      className="builder-btn builder-btn-primary"
                      onClick={handleAddMember}
                    >
                      + नवीन सदस्य जोडा
                    </button>
                  </div>

                  <div className="members-list">
                    {(config.familySection?.members || []).map((member, idx) => (
                      <div key={idx} className="member-row-card">
                        <img 
                          src={member.image || '/assets/family-1.png'} 
                          alt={member.name} 
                          className="member-thumbnail" 
                        />

                        <div className="builder-field-group">
                          <label className="builder-label">सदस्याचे नाव</label>
                          <input 
                            type="text"
                            className="builder-input"
                            value={member.name}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            placeholder="नाव"
                          />
                        </div>

                        <div className="builder-field-group">
                          <label className="builder-label">नाते / पद</label>
                          <input 
                            type="text"
                            className="builder-input"
                            value={member.relation}
                            onChange={(e) => handleMemberChange(idx, 'relation', e.target.value)}
                            placeholder="उदा. वडील / आई / मुलगा"
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label className="builder-btn builder-btn-secondary" style={{ cursor: 'pointer', textAlign: 'center' }}>
                            <span>📷 फोटो निवडा</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={(e) => handleImageUpload(e, (dataUrl) => handleMemberChange(idx, 'image', dataUrl))}
                            />
                          </label>

                          <button 
                            type="button"
                            className="builder-btn builder-btn-secondary"
                            style={{ color: '#ff7777', borderColor: 'rgba(255,100,100,0.3)' }}
                            onClick={() => handleRemoveMember(idx)}
                          >
                            हटवा
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: GALLERY & MUSIC */}
              {activeTab === 'gallery' && (
                <div className="builder-form-grid">
                  <div className="builder-field-group builder-full-width">
                    <label className="builder-label">पार्श्वभूमी संगीत (Audio Track Path / URL)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.audio?.path || ''}
                      onChange={(e) => updateConfigField('audio.path', e.target.value)}
                      placeholder="/assets/bgMusic.mp3"
                    />
                  </div>

                  <div className="builder-field-group">
                    <label className="builder-label">ऑडिओ व्हॉल्यूम (Volume: {config.audio?.volume ?? 0.35})</label>
                    <input 
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={config.audio?.volume ?? 0.35}
                      onChange={(e) => updateConfigField('audio.volume', parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: '#d4a64a', marginTop: '10px' }}
                    />
                  </div>

                  <div className="builder-field-group">
                    <label className="builder-label">क्रेडिट टेक्स्ट (Crafted By Line)</label>
                    <input 
                      type="text"
                      className="builder-input"
                      value={config.credit?.text || ''}
                      onChange={(e) => updateConfigField('credit.text', e.target.value)}
                    />
                  </div>

                  <div className="builder-field-group builder-full-width">
                    <label className="builder-label">गॅलरी फोटो (Gallery Photos)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px', marginTop: '8px' }}>
                      {(config.gallerySection?.images || []).map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', border: '1px solid rgba(212,166,74,0.3)', borderRadius: '12px', overflow: 'hidden' }}>
                          <img 
                            src={img.image} 
                            alt={`Gallery ${idx + 1}`} 
                            style={{ width: '100%', height: '110px', objectFit: 'cover', display: 'block' }} 
                          />
                          <label style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0, 
                            right: 0, 
                            background: 'rgba(0,0,0,0.7)', 
                            color: '#fff', 
                            fontSize: '0.72rem', 
                            textAlign: 'center', 
                            padding: '4px',
                            cursor: 'pointer' 
                          }}>
                            बदला
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }}
                              onChange={(e) => handleImageUpload(e, (dataUrl) => {
                                const updated = [...(config.gallerySection?.images || [])];
                                updated[idx] = { ...updated[idx], image: dataUrl };
                                updateConfigField('gallerySection.images', updated);
                              })}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: SAVED CLIENTS */}
              {activeTab === 'clients' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <p style={{ margin: 0, color: '#c9baa1', fontSize: '0.9rem' }}>
                      तुमच्या ब्राउझरमध्ये सेव्ह असलेले सर्व क्लायंट्स. एका क्लिकवर लोड किंवा शेअर करा.
                    </p>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        type="button" 
                        className="builder-btn builder-btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📤 JSON इंपोर्ट करा
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept=".json" 
                        style={{ display: 'none' }} 
                        onChange={handleImportJson} 
                      />

                      <button 
                        type="button" 
                        className="builder-btn builder-btn-primary"
                        onClick={() => {
                          resetToDefault();
                          showToast('नवीन क्लायंट टेम्पलेट तयार झाले!');
                        }}
                      >
                        + नवीन क्लायंट
                      </button>
                    </div>
                  </div>

                  <div className="saved-clients-grid">
                    {savedClients.map((client) => {
                      const themeInfo = themePalettes[client.theme] || themePalettes.royalBlue;
                      return (
                        <div key={client.id || client.clientSlug} className="client-card">
                          <div className="client-card-header">
                            <h3 className="client-card-name">{client.familyName || 'क्लायंट'}</h3>
                            <span className="client-card-theme" style={{ borderColor: themeInfo.gold }}>
                              {themeInfo.name}
                            </span>
                          </div>

                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#c9baa1' }}>
                            स्थापना: {client.utsavSection?.tabs?.[0]?.value || '—'}
                          </p>

                          <div className="client-card-actions">
                            <button
                              type="button"
                              className="builder-btn builder-btn-primary"
                              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                              onClick={() => {
                                loadClient(client);
                                showToast(`लोड झाले: ${client.familyName}`);
                              }}
                            >
                              एडिट करा
                            </button>

                            <button
                              type="button"
                              className="builder-btn builder-btn-secondary"
                              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                              onClick={() => {
                                const url = generateShareUrl(client);
                                navigator.clipboard?.writeText(url);
                                showToast('🔗 लिंक कॉपी झाली!');
                              }}
                            >
                              लिंक
                            </button>

                            <button
                              type="button"
                              className="builder-btn builder-btn-secondary"
                              style={{ fontSize: '0.8rem', padding: '6px 10px', color: '#ff7777' }}
                              onClick={() => {
                                if (confirm(`खरोखर "${client.familyName}" हटवायचे आहे का?`)) {
                                  deleteClientFromStorage(client.id);
                                  refreshSavedClients();
                                  showToast('हटवले!');
                                }
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="builder-toast">
          {toastMessage}
        </div>
      )}
    </>
  );
}
