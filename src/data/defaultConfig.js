// Default Invitation Configuration
export const defaultConfig = {
  id: 'patil-default',
  clientSlug: 'patil',
  theme: 'deepPlum',
  meta: {
    title: 'पाटील गणेश उत्सव',
    description: 'गणरायाच्या आगमनाचे सस्नेह आमंत्रण'
  },
  familyName: 'पाटील',
  heroTitle: 'बाप्पाचे आगमन',
  heroIntroLine: 'आमच्या घरी यावर्षी',
  familyNameInvite: 'पाटील परिवाराकडून',
  familySection: {
    text: 'गणरायाच्या आगमनाच्या या मंगल क्षणी आपण सर्वांनी उपस्थित राहून उत्सवाची शोभा वाढवावी.',
    members: [
      { name: 'स्वस्तिक पाटील', relation: 'वडील', image: '/assets/family-1.png' },
      { name: 'सुमन पाटील', relation: 'आई', image: '/assets/family-2.png' },
      { name: 'हिमांशु पाटील', relation: 'मुलगा', image: '/assets/family-3.png' },
      { name: 'कामना पाटील', relation: 'मुलगी', image: '/assets/family-4.png' }
    ]
  },
  utsavSection: {
    tabs: [
      { label: 'स्थापना', value: '१४ सप्टेंबर २०२६' },
      { label: 'आरती वेळ', values: ['सकाळी ८:००', 'सायंकाळी ७:३०'] }
    ],
    note: [
      'यावर्षी आमच्या घरी १४ सप्टेंबर २०२६ रोजी गणरायाची स्थापना होणार असून बाप्पाचा मुक्काम ५ दिवसांचा असणार आहे.',
      'या मंगल प्रसंगी आपण सर्वांनी सहकुटुंब उपस्थित राहून बाप्पाचे आशीर्वाद घ्यावेत, ही नम्र विनंती.'
    ]
  },
  locationSection: {
    address: 'पाटील निवास',
    fullAddress: 'प्लॉट नं. १२, गणेशनगर, अलिबाग, रायगड, महाराष्ट्र',
    mapsLink: 'https://maps.app.goo.gl/89wcuCdsd1RkTr5c8',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241318.121973907!2d72.87835265000001!3d19.081507449999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1783225988676!5m2!1sen!2sin',
    note: 'बाप्पाच्या दर्शनासाठी अवश्य या'
  },
  blessingsSection: {
    blessings: [
      'गणपती बाप्पा आपल्या जीवनात सुख, समृद्धी आणि आनंद घेऊन येवो.',
      'बाप्पाचे आशीर्वाद आपल्या परिवारावर सदैव राहो.',
      'मंगलमूर्ती मोरया! आपल्या सर्व इच्छा पूर्ण होवोत.',
      'गणराय आपल्या घरात आनंद आणि शांतता घेऊन येवो.',
      'आपल्या प्रत्येक कार्यात बाप्पाची कृपा लाभो.',
      'सुख, समाधान आणि भरभराट आपल्या जीवनात नांदो.',
      'गणेशोत्सवाचा हा मंगल उत्सव आपल्या आयुष्यात प्रकाश आणो.',
      'गणपती बाप्पाच्या कृपेने सर्व संकटे दूर होवोत.',
      'आपल्या परिवाराला आरोग्य, आनंद आणि यश लाभो.',
      'बाप्पाचे मंगल आशीर्वाद सदैव आपल्या सोबत राहोत.'
    ]
  },
  gallerySection: {
    images: [
      { image: '/assets/gallery-1.webp', label: '' },
      { image: '/assets/gallery-2.webp', label: '' },
      { image: '/assets/gallery-3.webp', label: '' },
      { image: '/assets/gallery-4.webp', label: '' }
    ]
  },
  finalSection: {
    message: ['आपली उपस्थिती हेच आमच्यासाठी', 'बाप्पाचे आशीर्वाद आहेत.'],
    familySignature: '— पाटील परिवार'
  },
  audio: {
    path: '/assets/bgMusic.mp3',
    volume: 0.35,
    autoplayAfterInteraction: true
  },
  credit: {
    text: 'Crafted by Sarthak Patil (Instagram - Sarthak_1963 & MediaMotive.co )',
    link: 'https://instagram.com/mediamotive.co'
  }
};

// Preset demo templates to test different families and themes easily
export const demoTemplates = [
  {
    ...defaultConfig,
    id: 'patil',
    clientSlug: 'patil',
    theme: 'deepPlum',
    familyName: 'पाटील',
    familyNameInvite: 'पाटील परिवाराकडून',
    finalSection: {
      message: ['आपली उपस्थिती हेच आमच्यासाठी', 'बाप्पाचे आशीर्वाद आहेत.'],
      familySignature: '— पाटील परिवार'
    }
  },
  {
    ...defaultConfig,
    id: 'deshmukh',
    clientSlug: 'deshmukh',
    theme: 'maroonRoyal',
    meta: {
      title: 'देशमुख गणेश उत्सव',
      description: 'गणरायाच्या आगमनाचे सस्नेह आमंत्रण'
    },
    familyName: 'देशमुख',
    heroTitle: 'बाप्पाचे आगमन',
    heroIntroLine: 'आमच्या निवासस्थानी यावर्षी',
    familyNameInvite: 'देशमुख परिवाराकडून',
    locationSection: {
      address: 'देशमुख सदन',
      fullAddress: 'सदन क्र. २४, शिवाजी चौक, पुणे, महाराष्ट्र',
      mapsLink: 'https://maps.google.com',
      mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121059.04365313936!2d73.7929272449175!3d18.524616453995874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf2e67461101%3A0x828d43bf9d9ee343!2sPune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin',
      note: 'सहकुटुंब सहपरिवार बाप्पाच्या दर्शनासाठी अवश्य या'
    },
    finalSection: {
      message: ['आपली उपस्थिती हेच आमच्यासाठी', 'बाप्पाचे मंगल आशीर्वाद आहेत.'],
      familySignature: '— देशमुख परिवार'
    }
  },
  {
    ...defaultConfig,
    id: 'sharma',
    clientSlug: 'sharma',
    theme: 'royalBlue',
    meta: {
      title: 'Sharma Family Ganesh Utsav',
      description: 'Cordially invite you for Ganesh Utsav celebrations'
    },
    familyName: 'शर्मा',
    heroTitle: 'बाप्पाचे आगमन',
    heroIntroLine: 'आमच्या घरी यावर्षी',
    familyNameInvite: 'शर्मा परिवाराकडून',
    finalSection: {
      message: ['आपली उपस्थिती हेच आमच्यासाठी', 'बाप्पाचे आशीर्वाद आहेत.'],
      familySignature: '— शर्मा परिवार'
    }
  }
];

// Helper to deep merge a partial config onto the default
export function mergeWithDefault(customConfig = {}) {
  if (!customConfig || typeof customConfig !== 'object') return { ...defaultConfig };
  
  return {
    ...defaultConfig,
    ...customConfig,
    meta: { ...defaultConfig.meta, ...(customConfig.meta || {}) },
    familySection: {
      ...defaultConfig.familySection,
      ...(customConfig.familySection || {}),
      members: Array.isArray(customConfig.familySection?.members) 
        ? customConfig.familySection.members 
        : defaultConfig.familySection.members
    },
    utsavSection: {
      ...defaultConfig.utsavSection,
      ...(customConfig.utsavSection || {}),
      tabs: Array.isArray(customConfig.utsavSection?.tabs) 
        ? customConfig.utsavSection.tabs 
        : defaultConfig.utsavSection.tabs,
      note: Array.isArray(customConfig.utsavSection?.note)
        ? customConfig.utsavSection.note
        : defaultConfig.utsavSection.note
    },
    locationSection: { ...defaultConfig.locationSection, ...(customConfig.locationSection || {}) },
    blessingsSection: {
      ...defaultConfig.blessingsSection,
      ...(customConfig.blessingsSection || {}),
      blessings: Array.isArray(customConfig.blessingsSection?.blessings)
        ? customConfig.blessingsSection.blessings
        : defaultConfig.blessingsSection.blessings
    },
    gallerySection: {
      ...defaultConfig.gallerySection,
      ...(customConfig.gallerySection || {}),
      images: Array.isArray(customConfig.gallerySection?.images)
        ? customConfig.gallerySection.images
        : defaultConfig.gallerySection.images
    },
    finalSection: {
      ...defaultConfig.finalSection,
      ...(customConfig.finalSection || {}),
      message: Array.isArray(customConfig.finalSection?.message)
        ? customConfig.finalSection.message
        : defaultConfig.finalSection.message
    },
    audio: { ...defaultConfig.audio, ...(customConfig.audio || {}) },
    credit: { ...defaultConfig.credit, ...(customConfig.credit || {}) }
  };
}
