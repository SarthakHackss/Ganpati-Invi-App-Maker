import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { curtainThemes } from './data/themes';
import { InvitationProvider, useInvitation } from './context/InvitationContext';
import BuilderStudio from './components/builder/BuilderStudio';

// Reusable Motion Components
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
  }
};

function FadeIn({ children, className = '', delay = 0, style = {}, tag = 'div' }) {
  const MotionTag = motion[tag] || motion.div;
  return (
    <MotionTag
      variants={{
        ...fadeUpVariants,
        visible: {
          ...fadeUpVariants.visible,
          transition: {
            ...fadeUpVariants.visible.transition,
            delay: delay
          }
        }
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10%' }}
      className={className}
      style={style}
    >
      {children}
    </MotionTag>
  );
}

function MusicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="1em" height="1em">
      <path
        fillRule="evenodd"
        d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.45, delayChildren: 0.2 }
  }
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }
  }
};

function Hero({ isMusicPlaying = false, onToggleMusic, introStarted = true }) {
  const { config, isAdmin, setIsBuilderOpen, setIsPinPromptOpen } = useInvitation();
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef(null);

  const handleSecretLogoClick = () => {
    const next = tapCount + 1;
    if (next >= 3) {
      setTapCount(0);
      if (isAdmin) {
        setIsBuilderOpen(prev => !prev);
      } else {
        setIsPinPromptOpen(true);
      }
    } else {
      setTapCount(next);
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = setTimeout(() => setTapCount(0), 1200);
    }
  };

  return (
    <section className="hero">
      <div className="hero-backdrop" />
      <div className="hero-noise" />
      <div className="hero-glow glow-1" />
      <div className="hero-glow glow-2" />

      <motion.div
        className="hero-inner"
        variants={heroContainerVariants}
        initial="hidden"
        animate={introStarted ? "visible" : "hidden"}
      >
        <motion.div className="hero-top-controls" variants={heroItemVariants}>
          <div 
            className="hero-logo" 
            onClick={handleSecretLogoClick} 
            title={isAdmin ? "आमंत्रण स्टुडिओ उघडा" : ""} 
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <img src="/assets/logo.webp" alt="Ganesh-Logo" />
            <p className="sacred-line">॥ श्री गणेशाय नमः ॥</p>
          </div>
          <div className="hero-actions">
            <button
              className={`circle-btn music-toggle ${isMusicPlaying ? 'active' : ''}`}
              onClick={onToggleMusic}
              aria-label="Toggle music"
              aria-pressed={isMusicPlaying}
              title="Toggle music"
            >
              <MusicIcon />
            </button>
          </div>
        </motion.div>

        <motion.div className="hero-copy" variants={heroItemVariants}>
          <p className="intro-line">{config.heroIntroLine || 'आमच्या घरी यावर्षी'}</p>
          <h1 className="hero-title">
            <span>बाप्पाचे</span>
            <span>आगमन</span>
          </h1>
        </motion.div>

        <motion.div className="visual-wrap" variants={heroItemVariants}>
          <img src="/assets/hero-visual.webp" alt="Ganpati Bappa" className="murti" />
        </motion.div>

        <motion.div className="invite-signature" variants={heroItemVariants}>
          <img src="/assets/divider.webp" alt="" className="invite-divider" />
          <p className="family-name">{config.familyNameInvite || `${config.familyName || ''} परिवाराकडून`}</p>
          <p className="invite-subtext">सस्नेह आमंत्रण</p>
          <img src="/assets/divider.webp" alt="" className="invite-divider" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function FamilySection() {
  const { config } = useInvitation();
  const [activeIndex, setActiveIndex] = useState(0);
  const viewportRef = useRef(null);
  const members = config.familySection?.members || [];

  const handlePrev = () => {
    if (!members.length) return;
    setActiveIndex(prev => (prev - 1 + members.length) % members.length);
  };

  const handleNext = () => {
    if (!members.length) return;
    setActiveIndex(prev => (prev + 1) % members.length);
  };

  const handleDotClick = (index) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const cards = viewport.querySelectorAll('.family-card-wrapper');
    if (cards[activeIndex]) {
      const card = cards[activeIndex];
      viewport.scrollTo({
        left: card.offsetLeft - viewport.clientWidth / 2 + card.clientWidth / 2,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, members.length]);

  return (
    <section className="section family-section">
      <FadeIn className="family-header">
        <p className="family-tag">INVITATION</p>
        <h2 className="family-heading">सस्नेह आमंत्रण</h2>
        <img src="/assets/divider.webp" alt="" className="family-divider" />
        <p className="family-text">{config.familySection?.text}</p>
        <img src="/assets/divider.webp" alt="" className="family-divider" />
      </FadeIn>

      <FadeIn className="family-showcase" delay={0.2}>
        <button className="family-arrow family-arrow-left" onClick={handlePrev} aria-label="Previous member">←</button>
        <div className="family-card-viewport" ref={viewportRef}>
          <div className="family-card-track">
            {members.map((member, index) => (
              <div className="family-card-wrapper" key={member.name + index}>
                <article className="family-card">
                  <div className="family-image-frame">
                    <div className="family-image-glow" />
                    <img src={member.image} alt={member.name} className="family-image" />
                  </div>
                  <div className="family-card-content">
                    <h3>{member.name}</h3>
                    {member.relation && <p>{member.relation}</p>}
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
        <button className="family-arrow family-arrow-right" onClick={handleNext} aria-label="Next member">→</button>
      </FadeIn>

      <FadeIn className="family-dots" delay={0.4}>
        {members.map((_, index) => (
          <span
            key={index}
            className={index === activeIndex ? 'active-dot' : ''}
            onClick={() => handleDotClick(index)}
          />
        ))}
      </FadeIn>
    </section>
  );
}

function UtsavSection() {
  const { config } = useInvitation();
  const utsavSection = config.utsavSection || { tabs: [], note: [] };

  return (
    <section className="section utsav-section">
      <img src="/assets/top-deco.webp" alt="" className="utsav-deco utsav-deco-top" />
      <img src="/assets/top-deco.webp" alt="" className="utsav-deco utsav-deco-bottom" />

      <FadeIn className="utsav-content">
        <p className="utsav-tag">FESTIVAL</p>
        <h2 className="utsav-heading">गणेश उत्सव</h2>
        <img src="/assets/divider.webp" alt="" className="utsav-divider" />

        <FadeIn className="utsav-tabs" delay={0.2}>
          {(utsavSection.tabs || []).map((tab, idx) => (
            <div className="utsav-tab" key={idx}>
              <span>{tab.label}</span>
              {tab.value ? (
                <h3>{tab.value}</h3>
              ) : (
                tab.values && tab.values.map((v, i) => <h3 key={i}>{v}</h3>)
              )}
            </div>
          ))}
        </FadeIn>

        {(utsavSection.note || []).length > 0 && (
          <FadeIn className="utsav-note" delay={0.4}>
            {utsavSection.note.map((line, idx) => (
              <p key={idx} style={{ margin: idx === 0 ? 0 : '12px 0 0' }}>{line}</p>
            ))}
          </FadeIn>
        )}
      </FadeIn>
    </section>
  );
}

function LocationSection() {
  const { config } = useInvitation();
  const locationSection = config.locationSection || {};

  return (
    <section className="section location-section">
      <FadeIn className="location-content">
        <p className="location-tag">LOCATION</p>
        <h2 className="location-heading">ठिकाण</h2>
        <img src="/assets/divider.webp" alt="" className="location-divider" />

        <FadeIn className="map-card" delay={0.2}>
          <div className="map-preview">
            <iframe
              src={locationSection.mapEmbed}
              title="Google Maps Location"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="map-overlay" />
          </div>
          <div className="map-info">
            <div className="map-address">
              <h3>{locationSection.address}</h3>
              <p>{locationSection.fullAddress}</p>
            </div>

            {locationSection.mapsLink && (
              <a
                href={locationSection.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="map-button"
              >
                गुगल मॅप्सवर पहा
              </a>
            )}
          </div>
          {locationSection.note && (
            <div className="map-note">{locationSection.note}</div>
          )}
        </FadeIn>
      </FadeIn>
    </section>
  );
}

function GallerySection() {
  const { config } = useInvitation();
  const gallerySection = config.gallerySection || { images: [] };

  return (
    <section className="section gallery-section">
      <img src="/assets/top-deco.webp" alt="" className="gallery-deco gallery-deco-top" />
      <img src="/assets/top-deco.webp" alt="" className="gallery-deco gallery-deco-bottom" />

      <FadeIn className="gallery-header">
        <p className="gallery-tag">PREPARATIONS</p>
        <h2 className="gallery-heading">आगमन की तयारी</h2>
        <img src="/assets/divider.webp" alt="" className="gallery-divider" />
      </FadeIn>

      <div className="gallery-grid">
        {(gallerySection.images || []).map((img, idx) => (
          <FadeIn className="gallery-item" delay={0.1 * idx} key={idx}>
            <img src={img.image} alt={img.label || `Gallery ${idx + 1}`} />
            <div className="gallery-overlay" />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function FinalSection() {
  const { config, isAdmin, setIsBuilderOpen, setIsPinPromptOpen } = useInvitation();
  const finalSection = config.finalSection || { message: [], familySignature: '' };
  const credit = config.credit || {};

  const handleOwnerCreditTrigger = (e) => {
    if (e.altKey || e.ctrlKey || e.detail >= 3) {
      e.preventDefault();
      if (isAdmin) {
        setIsBuilderOpen(prev => !prev);
      } else {
        setIsPinPromptOpen(true);
      }
    }
  };

  return (
    <section className="section final-section">
      <img src="/assets/top-deco.webp" alt="" className="final-deco final-deco-top" />

      <FadeIn className="final-content">
        <img src="/assets/divider.webp" alt="" className="final-divider" />
        <p className="final-message">
          {(finalSection.message || []).map((msg, idx) => (
            <span key={idx}>
              {idx > 0 && <br />}
              {msg}
            </span>
          ))}
        </p>
        <p className="final-family">{finalSection.familySignature}</p>
        <div className="final-glow" />
      </FadeIn>

      {credit.text && (
        <a 
          href={credit.link || '#'} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="crafted-by"
          onClick={handleOwnerCreditTrigger}
        >
          {credit.text}
        </a>
      )}
    </section>
  );
}

function CurtainIntro({ onOpen, onStartAudio, onComplete, themeName = 'deepPlum' }) {
  const [status, setStatus] = useState('closed'); // 'closed', 'opening', 'exiting'
  const statusRef = useRef('closed');
  const timeouts = useRef([]);
  const originalOverflow = useRef('');
  const isScrollUnlocked = useRef(false);

  const theme = useMemo(() => curtainThemes[themeName] || curtainThemes.deepPlum || curtainThemes.royalBlue, [themeName]);

  const isOpen = status !== 'closed';
  const isExiting = status === 'exiting';

  const openDuration = 4800; // ms
  const fadeDuration = 220; // ms

  const styleVariables = {
    '--curtain-intro-bg': theme.bg,
    '--curtain-intro-bg-deep': theme.bgDeep,
    '--curtain-intro-atmosphere': theme.atmosphere,
    '--curtain-intro-panel-shade': theme.panelShade,
    '--curtain-open-duration': `${openDuration}ms`,
    '--curtain-overlay-fade-duration': `${fadeDuration}ms`,
  };

  const clearTimeouts = useCallback(() => {
    timeouts.current.forEach(window.clearTimeout);
    timeouts.current = [];
  }, []);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const unlockScroll = useCallback(() => {
    if (!isScrollUnlocked.current) {
      document.body.style.overflow = originalOverflow.current;
      isScrollUnlocked.current = true;
    }
  }, []);

  const lockScroll = useCallback(() => {
    originalOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    isScrollUnlocked.current = false;
  }, []);

  useEffect(() => {
    lockScroll();
    return () => {
      clearTimeouts();
      unlockScroll();
    };
  }, [clearTimeouts, lockScroll, unlockScroll]);

  const handleOpen = useCallback(() => {
    if (statusRef.current !== 'closed') return;
    setStatus('opening');
    onOpen?.();

    const audioTimer = window.setTimeout(() => {
      onStartAudio?.();
    }, 450);
    timeouts.current.push(audioTimer);

    const unlockTimer = window.setTimeout(() => {
      unlockScroll();
    }, openDuration * 0.42);
    timeouts.current.push(unlockTimer);

    const completeTimer = window.setTimeout(() => {
      setStatus('exiting');
      const exitTimer = window.setTimeout(() => {
        onComplete?.();
      }, fadeDuration);
      timeouts.current.push(exitTimer);
    }, openDuration);
    timeouts.current.push(completeTimer);
  }, [onOpen, onStartAudio, onComplete, openDuration, fadeDuration, unlockScroll]);

  return (
    <div
      className={`curtain-intro curtain-intro--${status}`}
      style={styleVariables}
      aria-hidden={isExiting}
    >
      <div className="curtain-intro__atmosphere" aria-hidden="true" />
      <div className="curtain-intro__glow curtain-intro__glow--ambient" aria-hidden="true" />
      <div className="curtain-intro__glow curtain-intro__glow--center" aria-hidden="true" />

      <div className="curtain-intro__gate curtain-intro__gate--left" aria-hidden="true">
        <div className="gate-panel">
          <div className="panel-frame" />
          <div className="gate-pillar" />
          <div className="panel-top-line" />
          <div className="gate-center-detail" />
        </div>
      </div>

      <div className="curtain-intro__gate curtain-intro__gate--right" aria-hidden="true">
        <div className="gate-panel">
          <div className="panel-frame" />
          <div className="gate-pillar" />
          <div className="panel-top-line" />
          <div className="gate-center-detail" />
        </div>
      </div>

      <button
        type="button"
        className="curtain-intro__button"
        onClick={handleOpen}
        aria-label="Open Ganpati Invitation"
        disabled={isOpen}
      >
        <div className="curtain-intro__button-content">
          <span className="curtain-intro__button-text">॥ गणेशाय नमः ॥</span>
          <span className="curtain-intro__button-subtitle">TAP TO OPEN</span>
        </div>
        <span className="curtain-intro__button-shine" aria-hidden="true" />
      </button>
    </div>
  );
}

// Audio volume fader helper
function animateVolume(audio, targetVolume, duration = 2200) {
  let startTime = performance.now();
  let animationId = 0;

  const step = (now) => {
    const elapsed = Math.max(0, Math.min((now - startTime) / duration, 1));
    const progress = 1 - Math.pow(1 - elapsed, 3);
    audio.volume = Math.max(0, Math.min(targetVolume * progress, 1));

    if (elapsed < 1) {
      animationId = window.requestAnimationFrame(step);
    }
  };

  animationId = window.requestAnimationFrame(step);
  return () => window.cancelAnimationFrame(animationId);
}

function InvitationContent() {
  const { config } = useInvitation();
  const [introState, setIntroState] = useState('closed'); // 'closed', 'opening', 'complete'
  const [introStarted, setIntroStarted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const audioRef = useRef(null);
  const audioFadeRef = useRef(null);
  const timeoutRef = useRef(null);

  const volume = useMemo(() => {
    const vol = config.audio?.volume;
    return Math.min(Math.max(vol ?? 0.35, 0), 1);
  }, [config.audio?.volume]);

  useEffect(() => {
    document.body.setAttribute('translate', 'no');
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;

    const handleAudioEvent = () => {
      setIsMusicPlaying(!audio.paused);
    };

    audio.addEventListener('play', handleAudioEvent);
    audio.addEventListener('pause', handleAudioEvent);
    audio.addEventListener('ended', handleAudioEvent);

    return () => {
      audioFadeRef.current?.();
      audio.removeEventListener('play', handleAudioEvent);
      audio.removeEventListener('pause', handleAudioEvent);
      audio.removeEventListener('ended', handleAudioEvent);
    };
  }, [volume]);

  const playAudio = useCallback(async ({ fadeIn = false, restart = false } = {}) => {
    const audio = audioRef.current;
    if (!audio) return false;
    audioFadeRef.current?.();
    if (restart) audio.currentTime = 0;
    if (fadeIn) audio.volume = 0;

    try {
      await audio.play();
      setIsMusicPlaying(true);
      if (fadeIn) {
        audioFadeRef.current = animateVolume(audio, volume);
      } else {
        audio.volume = volume;
      }
      return true;
    } catch (err) {
      if (audio.paused) setIsMusicPlaying(false);
      return false;
    }
  }, [volume]);

  const pauseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audioFadeRef.current?.();
      audio.pause();
      setIsMusicPlaying(false);
    }
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  }, [playAudio, pauseAudio]);

  const handleOpenCurtain = useCallback(() => {
    setIntroState('opening');
    timeoutRef.current = window.setTimeout(() => {
      setIntroStarted(true);
    }, 800);
  }, []);

  const handleCompleteCurtain = useCallback(() => {
    setIntroState('complete');
    setIntroStarted(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  return (
    <>
      <audio
        id="bgMusic"
        ref={audioRef}
        src={config.audio?.path || '/assets/bgMusic.mp3'}
        loop
        preload="auto"
      />
      <div className="site-shell" data-intro-state={introState}>
        <Hero
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={toggleMusic}
          introStarted={introStarted}
        />
        <FamilySection />
        <UtsavSection />
        <LocationSection />
        <GallerySection />
        <FinalSection />
      </div>
      {introState !== 'complete' && (
        <CurtainIntro
          themeName={config.theme}
          onOpen={handleOpenCurtain}
          onStartAudio={() => playAudio({ fadeIn: false, restart: true })}
          onComplete={handleCompleteCurtain}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <InvitationProvider>
      <InvitationContent />
      <BuilderStudio />
    </InvitationProvider>
  );
}
