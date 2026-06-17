import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Phone, 
  Lock, 
  Sprout, 
  ChevronRight, 
  Globe, 
  AlertCircle,
  Sun,
  Activity
} from 'lucide-react';

interface FarmerLoginProps {
  onLoginSuccess: (farmerName: string, farmLocation: string, farmId: string) => void;
  isDarkMode: boolean;
}

type Language = 'kannada' | 'tamil' | 'telugu' | 'malayalam' | 'english';

interface LocalizedText {
  loginTitle: string;
  loginSub: string;
  portalHead: string;
  welcome: string;
  welcomeSub: string;
  shubhLabh: string;
  motto: string;
  farmerName: string;
  farmerNamePlaceholder: string;
  mobileNo: string;
  securityPin: string;
  selectBarn: string;
  proceedBtn: string;
  quickAccess: string;
  quickAccessSub: string;
  errName: string;
  errPhone: string;
  errPin: string;
  activeSensors: string;
  systemFooter: string;
  barnNames: Record<string, string>;
}

const TRANSLATIONS: Record<Language, LocalizedText> = {
  kannada: {
    loginTitle: "ಖಚಿತಪಡಿಸಿದ ಕೃಷಕ ಪ್ರವೇಶ",
    loginSub: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಕೆಳಗಿನ ಪ್ರಸಿದ್ಧ ಫಾರ್ಮ್ ಆಯ್ಕೆಮಾಡಿ",
    portalHead: "ಸುರಕ್ಷಿತ ರೈತ ಲಾಗಿನ್",
    welcome: "ನಮಸ್ತೆ, ಕೃಷಿಕ ಬಂಧುಗಳೇ!",
    welcomeSub: "ನಿಮ್ಮ ಸಮೃದ್ಧಿಯೇ ನಮ್ಮ ದೇಶದ ಐಶ್ವರ್ಯ. ತತ್ಸಮಯ ವಾತಾವರಣ, ಜೈವಿಕ ಸುರಕ್ಷತೆ ನಿಯಂತ್ರಣ ಪ್ರವೇಶಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ.",
    shubhLabh: "ಶುಭ ಲಾಭ • ಸಮೃದ್ಧಿ ದ್ವಾರ",
    motto: '"ಕೃಷಿಮೂಲಂ ಹಿ ಜೀವನಂ" - ಕೃಷಿಯೇ ಜೀವನಕ್ಕೆ ಜೀವನಾಡಿ.',
    farmerName: "೧. ರೈತರ ಪೂರ್ಣ ಹೆಸರು (Farmer Name)",
    farmerNamePlaceholder: "ಉದಾ: ಅನಂತ್ ಹೆಗಡೆ",
    mobileNo: "೨. ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Mobile Number)",
    securityPin: "೩. ಭದ್ರತಾ ಪಿನ್ (Security PIN)",
    selectBarn: "೪. ನಿಯೋಜಿತ ಕೋಳಿ ಫಾರ್ಮ್ (Select Barn)",
    proceedBtn: "ಕೃಷಿ ಪೋರ್ಟಲ್‌ಗೆ ಪ್ರವೇಶಿಸಿ",
    quickAccess: "ತ್ವರಿತ ಸುಲಭ ಪ್ರವೇಶ",
    quickAccessSub: "ನೋಂದಾಯಿತ ರೈತರ ಹೆಸರಿನ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ತಕ್ಷಣ ಲಾಗಿನ್ ಮಾಡಿ:",
    errName: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
    errPhone: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
    errPin: "ದಯವಿಟ್ಟು 4-ಅಂಕಿಯ ಭದ್ರತಾ ಪಿನ್ ನಮೂದಿಸಿ.",
    activeSensors: "ಜೈವಿಕ ಸುರಕ್ಷತಾ ಸಂವೇದಕಗಳು ಸಕ್ರಿಯವಾಗಿವೆ",
    systemFooter: "© २०२६ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರ • ಕೋಳಿ ರಕ್ಷಕ ಯೋಜನೆ",
    barnNames: {
      'KA-BARN-09': 'ಕರ್ನಾಟಕ ಫಾರ್ಮ್-೦೯ • KA-BARN-09 (ಸಕ್ರಿಯ)',
      'TN-BARN-02': 'ತಮಿಳುನಾಡು ಫಾರ್ಮ್-೦೨ • TN-BARN-02',
      'AP-BARN-15': 'ಆಂಧ್ರಪ್ರದೇಶ ಫಾರ್ಮ್-೧೫ • AP-BARN-15',
      'KL-BARN-08': 'ಕೇರಳ ಫಾರ್ಮ್-೦৮ • KL-BARN-08'
    }
  },
  tamil: {
    loginTitle: "உறுதிப்படுத்தப்பட்ட விவசாயி உள்நுழைவு",
    loginSub: "உங்கள் விவரங்களை உள்ளிடவும் அல்லது கீழே உள்ள விரைவான பண்ணையைத் தேர்ந்தெடுக்கவும்",
    portalHead: "பாதுகாப்பான உழவர் போர்டல்",
    welcome: "வணக்கம், அன்பான உழவர்களே!",
    welcomeSub: "உங்கள் செழிப்பு நாட்டின் வளர்ச்சிக்கு வழிவகுக்கும். நிகழ்நேர பண்ணை வானிலை மற்றும் சுகாதார பகுப்பாய்வுகளை அணுக உள்நுழைக.",
    shubhLabh: "சுப லாபம் • செழிப்பு மையம்",
    motto: '"கிருஷ்ஷிமூலம் ஹி ஜீவனம்" - விவசாயமே வாழ்வின் அஸ்திவாரம்.',
    farmerName: "1. விவசாயியின் முழு பெயர் (Farmer Name)",
    farmerNamePlaceholder: "உதாரணம்: செல்வம் பிள்ளை",
    mobileNo: "2. அலைபேசி எண் (Mobile Number)",
    securityPin: "3. பாதுகாப்பு பின் (Security PIN)",
    selectBarn: "4. அங்கீகரிக்கப்பட்ட பண்ணை",
    proceedBtn: "பண்ணை டாஷ்போர்டுக்குச் செல்க",
    quickAccess: "விரைவான அணுகல் போர்டல்",
    quickAccessSub: "உள்நுழைய பதிவுசெய்யப்பட்ட மேற்பார்வையாளரைத் தேர்ந்தெடுக்கவும்:",
    errName: "தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.",
    errPhone: "தயவுசெய்து செல்லுபடியாகும் 10-இலக்க மொபைல் எண்ணை உள்ளிடவும்.",
    errPin: "தயவுசெய்து 4-இலக்க பாதுகாப்பு பின்னை உள்ளிடவும்.",
    activeSensors: "உயிரியல் பாதுகாப்பு சென்சார்கள் ஆன்லைனில் உள்ளன",
    systemFooter: "© 2026 கிருஷி விஞ்ஞான் கேந்திரா • ஏவியன் பவுல்ட்ரிகார்ட்",
    barnNames: {
      'KA-BARN-09': 'கர்நாடகா பண்ணை-09 • KA-BARN-09',
      'TN-BARN-02': 'தமிழ்நாடு பண்ணை-02 • TN-BARN-02 (செயலில்)',
      'AP-BARN-15': 'ஆந்திரா பண்ணை-15 • AP-BARN-15',
      'KL-BARN-08': 'கேரளா பண்ணை-08 • KL-BARN-08'
    }
  },
  telugu: {
    loginTitle: "ధృవీకరించబడిన రైతు లాగిన్",
    loginSub: "దయచేసి మీ వివరాలను నమోదు చేయండి లేదా క్రింద ఒక ఫామ్‌ను ఎంచుకోండి",
    portalHead: "సురక్షిత రైతు పోర్టల్",
    welcome: "నమస్తే, ప్రియమైన అన్నదాతా!",
    welcomeSub: "మీ అభివృద్ధియే దేశ పురోభివృద్ధి. నిజ-సమయ వాతావరణం మరియు కోళ్ల హెల్త్ విశ్లేషణను వీక్షించడానికి లాగిన్ అవ్వండి.",
    shubhLabh: "శుభ లాభం • సమృద్ధి కేంద్రము",
    motto: '"కృషిమూలం హి జీవనం" - వ్యవసాయమే జీవనాధారం.',
    farmerName: "1. రైతు పూర్తి పేరు (Farmer Name)",
    farmerNamePlaceholder: "ఉదా: యస్. వెంకటేశ్వర్లు",
    mobileNo: "2. మొబైల్ నంబరు (Mobile Number)",
    securityPin: "3. సెక్యూరిటీ పిన్ (Security PIN)",
    selectBarn: "4. అధికారం పొందిన షెడ్డు (Select Barn)",
    proceedBtn: "రైతు డ్యాష్‌బోర్డ్‌లోకి ప్రవేశించండి",
    quickAccess: "త్వరిత ప్రవేశ ద్వారం",
    quickAccessSub: "వెంటనే లాగిన్ అవ్వడానికి క్రింది రైతును ఎంచుకోండి:",
    errName: "దయచేసి మీ పేరును నమోదు చేయండి.",
    errPhone: "దయచేసి సరైన 10 అంకెల మొబైల్ నంబరును నమోదు చేయండి.",
    errPin: "దయచేసి 4 అంకెల భద్రతా పిన్ను నమోదు చేయండి.",
    activeSensors: "బయో-సెక్యూరిటీ సెన్సార్లు పనిచేస్తున్నాయి",
    systemFooter: "© 2026 కృషి విజ్ఞాన కేంద్రం • పౌల్ట్రీ రక్షక్",
    barnNames: {
      'KA-BARN-09': 'కర్ణాటక ఫామ్-09 • KA-BARN-09',
      'TN-BARN-02': 'తమిళనాడు ఫామ్-02 • TN-BARN-02',
      'AP-BARN-15': 'ఆంధ్రప్రదేశ్ ఫామ్-15 • AP-BARN-15 (యాక్టివ్)',
      'KL-BARN-08': 'കേരള ഫാം-08 • KL-BARN-08'
    }
  },
  malayalam: {
    loginTitle: "അംഗീകൃത കർഷക ലോഗിൻ",
    loginSub: "നിങ്ങളുടെ വിവരങ്ങൾ നൽകുക അല്ലെങ്കിൽ താഴെ ഒരു ഫാം തിരഞ്ഞെടുക",
    portalHead: "സുരക്ഷിത കർഷക പോർട്ടൽ",
    welcome: "നമസ്കാരം, കർഷക സുഹൃത്തുക്കളെ!",
    welcomeSub: "നിങ്ങളുടെ സമൃദ്ധിയാണ് നമ്മുടെ രാജ്യത്തിന്റെ വളർച്ച. തത്സമയ കാലാവസ്ഥാ വിവരങ്ങളും കോഴി ഫാം വിശകലനവും കാണാൻ ലോഗിൻ ചെയ്യുക.",
    shubhLabh: "ശുഭ ലാഭം • സമൃദ്ധി കേന്ദ്രം",
    motto: '"കൃഷിമൂലം ഹി ജീവനം" - കൃഷിയാണ് മനുഷ്യജീവിതത്തിന്റെ ആധാരം.',
    farmerName: "1. കർഷകന്റെ പേര് (Farmer Name)",
    farmerNamePlaceholder: "ഉദാ: കെ. രാഘവൻ",
    mobileNo: "2. മൊബൈൽ നമ്പർ (Mobile Number)",
    securityPin: "3. സുരക്ഷാ പിൻ (Security PIN)",
    selectBarn: "4. അംഗീകൃത കോഴി വളർത്തൽ കേന്ദ്രം",
    proceedBtn: "കർഷക ഡാഷ്‌ബോർഡിലേക്ക് പ്രവേശിക്കുക",
    quickAccess: "ദ്രുത പ്രവേശന പോർട്ടൽ",
    quickAccessSub: "ഉടൻ ലോഗിൻ ചെയ്യാൻ താഴെ ഒരു കർഷകനെ തിരഞ്ഞെടുക്കുക:",
    errName: "ദയവായി നിങ്ങളുടെ പേര് നൽകുക.",
    errPhone: "ദയവായി സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.",
    errPin: "ദയവായി 4 അക്ക സുരക്ഷാ പിൻ നൽകുക.",
    activeSensors: "ബയോ സെക്യൂരിറ്റി സെൻസറുകൾ സജീവമാണ്",
    systemFooter: "© 2026 കൃഷി വിജ്ഞാൻ കേന്ദ്രം • പൗൾട്രി ഗാർഡ്",
    barnNames: {
      'KA-BARN-09': 'കർണാടക ഫാം-09 • KA-BARN-09',
      'TN-BARN-02': 'തമിഴ്‌നാട് ഫാം-02 • TN-BARN-02',
      'AP-BARN-15': 'ആന്ധ്രാപ്രദേശ് ഫാം-15 • AP-BARN-15',
      'KL-BARN-08': 'കേരള ഫാം-08 • KL-BARN-08 (സജീവം)'
    }
  },
  english: {
    loginTitle: "Farmer Certified Log In",
    loginSub: "Enter your credentials or quickly select a registered South Indian farm below",
    portalHead: "Secure Farmers Portal",
    welcome: "Welcome, Farmers!",
    welcomeSub: "Your prosperity is the gateway to our nation's growth. Access real-time environmental data and AI-backed poultry diagnostics.",
    shubhLabh: "Shubh Labh • Prosperity Hub",
    motto: '"Krishimoolam Hi Jeevanam" - Agriculture is the true base of life.',
    farmerName: "1. Farmer Full Name",
    farmerNamePlaceholder: "e.g. Ananth Hegde",
    mobileNo: "2. Mobile Number",
    securityPin: "3. Security PIN",
    selectBarn: "4. Authorized Farm Barn",
    proceedBtn: "Proceed to Farmer Dashboard",
    quickAccess: "QUICK ACCESS PORTAL",
    quickAccessSub: "Select any registered supervisor to log in instantly:",
    errName: "Please enter your name.",
    errPhone: "Please enter a valid 10-digit mobile number.",
    errPin: "Please enter a 4-digit security PIN.",
    activeSensors: "Bio-Security Sensors Online",
    systemFooter: "© 2026 Krishi Vigyan Kendra • Avian PoultryGuard Project",
    barnNames: {
      'KA-BARN-09': 'Karnataka Barn-09 (Active)',
      'TN-BARN-02': 'Tamil Nadu Barn-02',
      'AP-BARN-15': 'Andhra Pradesh Barn-15',
      'KL-BARN-08': 'Kerala Barn-08'
    }
  }
};

const PRESET_FARMERS = [
  {
    name: "Ananth Hegde • ಅನಂತ್ ಹೆಗಡೆ",
    location: "Sirsi, Karnataka • ಶಿರಸಿ, ಕರ್ನಾಟಕ",
    farmId: "KA-BARN-09",
    phone: "9448002211",
    role: "Poultry Bio-Security Expert • ಕುक्ಕುಟ ಜೈವಿಕ ಭದ್ರತಾ ತಜ್ಞ",
    pin: "5678"
  },
  {
    name: "Selvam Pillai • செல்வம் பிள்ளை",
    location: "Madurai, Tamil Nadu • மதுரை, தமிழ்நாடு",
    farmId: "TN-BARN-02",
    phone: "9845321076",
    role: "Senior Poultry Supervisor • மூத்த கோழி வளர்ப்பு மேற்பார்வையாளர்",
    pin: "1234"
  },
  {
    name: "Y. Venkateswarlu • వెంకటేశ్వర్లు",
    location: "Guntur, Andhra Pradesh • గుంటూరు, ఆంధ్రప్రదేశ్",
    farmId: "AP-BARN-15",
    phone: "9123456789",
    role: "Cooperatives Director • సహకార డైరెక్టర్",
    pin: "4321"
  },
  {
    name: "K. Raghavan • കെ രാഘവൻ",
    location: "Palakkad, Kerala • പാലക്കാട്, കേരളം",
    farmId: "KL-BARN-08",
    phone: "9447551020",
    role: "Poultry Health Checker • പൗൾട്രി ആരോഗ്യ പരിശോധകൻ",
    pin: "8888"
  }
];

export default function FarmerLogin({ onLoginSuccess, isDarkMode }: FarmerLoginProps) {
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [farmSelect, setFarmSelect] = useState('KA-BARN-09');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('english');

  const text = TRANSLATIONS[lang];

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nameInput.trim()) {
      setErrorMsg(text.errName);
      return;
    }
    if (phoneInput.length < 10) {
      setErrorMsg(text.errPhone);
      return;
    }
    if (pinInput.length !== 4) {
      setErrorMsg(text.errPin);
      return;
    }

    const formattedName = nameInput.trim();
    // Lookup location based on selected state farmId
    let farmLoc = 'South India Farm';
    if (farmSelect === 'KA-BARN-09') farmLoc = lang === 'kannada' ? 'ಶಿರಸಿ, ಕರ್ನಾಟಕ' : 'Sirsi, Karnataka';
    else if (farmSelect === 'TN-BARN-02') farmLoc = lang === 'tamil' ? 'மதுரை, தமிழ்நாடு' : 'Madurai, Tamil Nadu';
    else if (farmSelect === 'AP-BARN-15') farmLoc = lang === 'telugu' ? 'గుంటూరు, ఆంధ్రప్రదేశ్' : 'Guntur, Andhra Pradesh';
    else if (farmSelect === 'KL-BARN-08') farmLoc = lang === 'malayalam' ? 'പാലക്കാട്, കേരളം' : 'Palakkad, Kerala';

    onLoginSuccess(formattedName, farmLoc, farmSelect);
  };

  const handlePresetSelect = (preset: typeof PRESET_FARMERS[0]) => {
    // Automatically switch to correct language based on state preset for incredible experience
    if (preset.farmId === 'KA-BARN-09') setLang('kannada');
    else if (preset.farmId === 'TN-BARN-02') setLang('tamil');
    else if (preset.farmId === 'AP-BARN-15') setLang('telugu');
    else if (preset.farmId === 'KL-BARN-08') setLang('malayalam');

    // Extract appropriate native or english name based on current language or native split
    const parts = preset.name.split('•');
    const parsedName = lang === 'english' ? parts[0].trim() : parts[1].trim();

    const locParts = preset.location.split('•');
    const parsedLocation = lang === 'english' ? locParts[0].trim() : locParts[1].trim();

    onLoginSuccess(parsedName, parsedLocation, preset.farmId);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 relative overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0f1412] text-[#e2ede8]' : 'bg-[#faf8f5] text-slate-800'
    }`}>
      
      {/* Visual Ornamentation Background Circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-orange-500/10 pointer-events-none flex items-center justify-center">
        <div className="w-80 h-80 rounded-full border border-amber-500/15 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full border border-yellow-500/20" />
        </div>
      </div>
      <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full border border-emerald-500/10 pointer-events-none flex items-center justify-center">
        <div className="w-[380px] h-[380px] rounded-full border border-yellow-500/15 flex items-center justify-center">
          <div className="w-80 h-80 rounded-full border border-amber-500/20" />
        </div>
      </div>

      {/* Traditional Thoranam Garland (Mango leaves & Marigolds) hanging at the top */}
      <div className="absolute top-0 left-0 right-0 h-4 flex justify-around items-start pointer-events-none overflow-hidden z-10 select-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center flex-shrink-0 -mt-1">
            {/* Hanging thread */}
            <div className="w-[1px] h-3.5 bg-amber-600/50" />
            
            {/* Glowing Marigold blossom beads */}
            <div className={`w-3.5 h-3.5 rounded-full shadow-sm ${
              i % 2 === 0 
                ? 'bg-[#f59e0b] border border-[#d97706] animate-pulse' 
                : 'bg-[#ea580c] border border-[#c2410c]'
            }`} />
            
            {/* Green Mango leaf hanging down */}
            <div className="w-2.5 h-4 bg-emerald-600 dark:bg-emerald-700 rounded-b-xl rounded-t-sm origin-top transform rotate-12 -mt-1 shadow-sm" />
          </div>
        ))}
      </div>

      {/* Language Switcher bar */}
      <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center z-10 pt-6 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#ea580c]/10 dark:bg-[#ea580c]/25 rounded-lg border border-[#ea580c]/30">
            <Sprout className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <span className="text-xs font-bold tracking-wider font-mono text-slate-500 dark:text-slate-400">
            SOUTH INDIAN AGRICARE
          </span>
        </div>
        
        {/* Multilingual South Indian Language selector panel */}
        <div className="flex flex-wrap gap-1.5 bg-white/40 dark:bg-[#121815]/40 backdrop-blur-xs p-1 rounded-full border border-[#ea580c]/20">
          {(['kannada', 'tamil', 'telugu', 'malayalam', 'english'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all duration-150 ${
                lang === l 
                  ? 'bg-gradient-to-r from-[#ea580c] to-[#f59e0b] text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-[#ea580c]/10'
              }`}
            >
              {l === 'kannada' && 'ಕನ್ನಡ'}
              {l === 'tamil' && 'தமிழ்'}
              {l === 'telugu' && 'తెలుగు'}
              {l === 'malayalam' && 'മലയാളം'}
              {l === 'english' && 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container Grid */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 my-auto items-center z-10 py-6">
        
        {/* Left Column: Traditional Diya & warm welcome card */}
        <div className="md:col-span-5 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#ea580c]/10 text-[#ea580c] dark:bg-[#ea580c]/20 dark:text-[#f97316] border border-[#ea580c]/20">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            {text.portalHead}
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans text-slate-800 dark:text-white leading-tight">
              {text.welcome.split(',')[0]}, <br />
              <span className="text-[#ea580c]">
                {text.welcome.includes(',') ? text.welcome.split(',')[1].replace('!', '').trim() : text.welcome}
              </span>!
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#a0b2a6] font-sans leading-relaxed">
              {text.welcomeSub}
            </p>
          </div>

          {/* Glowing Auspicious Brass Diya / Nilavilakku Widget */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#fefaf3] to-[#faf3e3] dark:from-[#1b1e1c] dark:to-[#121614] border border-[#e8dcb9]/60 dark:border-[#343a36]/80 flex gap-4 items-center shadow-xs text-left">
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#ea580c]/10 dark:bg-[#ea580c]/20 rounded-full border border-[#ea580c]/30">
              {/* Nilavilakku / Kuthuvilakku Brass Diya Symbol representation */}
              <svg viewBox="0 0 100 100" className="w-8 h-8 text-[#ea580c] -mt-1">
                <path fill="currentColor" d="M15 55 C 15 80, 85 80, 85 55 C 85 49, 75 48, 50 48 C 25 48, 15 49, 15 55 Z" />
                <path fill="#f59e0b" d="M50 12 C 43 25, 43 48, 50 48 C 57 48, 57 25, 50 12 Z" className="animate-pulse origin-bottom" style={{ transformOrigin: '50px 48px' }} />
              </svg>
              {/* Flame aura light flicker */}
              <div className="absolute top-1.5 w-3 h-3 bg-yellow-400 rounded-full blur-xs opacity-80 animate-ping" />
            </div>

            <div className="space-y-0.5">
              <div className="text-xs font-bold text-[#b45309] dark:text-[#f59e0b] tracking-wider uppercase">
                {text.shubhLabh}
              </div>
              <p className="text-[11px] text-[#6b5832] dark:text-slate-400 font-medium leading-normal">
                {text.motto}
              </p>
            </div>
          </div>

          {/* State support list badges */}
          <div className="pt-2 text-left space-y-4">
            <div>
              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Active South States:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Karnataka • ಕರ್ನಾಟಕ', 'Tamil Nadu • தமிழ்நாடு', 'Andhra Pradesh • ఆంధ్రప్రదేశ్', 'Kerala • കേരളം'].map((st) => (
                  <span key={st} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-[10px] text-slate-500 border border-slate-200/50 dark:border-slate-800/80">
                    {st.split('•')[lang === 'english' ? 0 : 1]?.trim() || st}
                  </span>
                ))}
              </div>
            </div>

            {/* Elegant Creator & Developer Card */}
            <div className="p-3.5 rounded-xl border border-[#eedfc6]/40 dark:border-slate-800 bg-[#fdfdfd]/50 dark:bg-[#111512]/40 backdrop-blur-xs shadow-xs space-y-1 text-left">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#ea580c] dark:text-[#f59e0b] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Primary Project Developer
              </div>
              <div className="font-sans font-black text-xs text-slate-800 dark:text-slate-100 flex items-center justify-between">
                <span>Anurag Das</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#ea580c]/10 text-[#ea580c] dark:bg-[#f59e0b]/10 dark:text-[#f59e0b]">
                  Creator
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-[#a0b2a6] flex items-center gap-1.5 pt-0.5">
                <span>✉️</span>
                <span className="hover:underline select-all">anuragdas.1803@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Farmer Login Form */}
        <div className="md:col-span-7 space-y-6">
          <div className="p-6 md:p-8 rounded-2xl border bg-white/95 dark:bg-[#121614]/95 shadow-md flex flex-col relative overflow-hidden border-[#e5d6be] dark:border-[#2e3732]">
            
            {/* Top orange floral decorative line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />

            <div className="text-center mb-6">
              <h2 className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                {text.loginTitle}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                {text.loginSub}
              </p>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-500 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Core credentials form */}
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {text.farmerName}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={text.farmerNamePlaceholder}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border font-sans bg-slate-50 dark:bg-slate-900/60 border-[#eedfc6]/60 dark:border-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#ea580c] transition duration-150"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {text.mobileNo}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 9448002211"
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border font-sans bg-slate-50 dark:bg-slate-900/60 border-[#eedfc6]/60 dark:border-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#ea580c] transition duration-150"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    {text.securityPin}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border text-center tracking-widest font-mono bg-slate-50 dark:bg-slate-900/60 border-[#eedfc6]/60 dark:border-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#ea580c] transition duration-150"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  {text.selectBarn}
                </label>
                <select
                  value={farmSelect}
                  onChange={(e) => setFarmSelect(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border font-sans bg-slate-50 dark:bg-slate-900/60 border-[#eedfc6]/60 dark:border-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-[#ea580c] transition duration-150"
                >
                  <option value="KA-BARN-09">{text.barnNames['KA-BARN-09']}</option>
                  <option value="TN-BARN-02">{text.barnNames['TN-BARN-02']}</option>
                  <option value="AP-BARN-15">{text.barnNames['AP-BARN-15']}</option>
                  <option value="KL-BARN-08">{text.barnNames['KL-BARN-08']}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#ea580c] to-[#f59e0b] hover:from-[#c2410c] hover:to-[#ea580c] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition duration-200 cursor-pointer flex items-center justify-center gap-2 border border-orange-500/30"
              >
                <span>{text.proceedBtn}</span>
                <ChevronRight className="w-4 h-45" />
              </button>
            </form>

            {/* OR line divider */}
            <div className="flex items-center my-5">
              <div className="flex-grow border-t border-dashed border-slate-200 dark:border-slate-800" />
              <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#ea580c]/80 bg-white dark:bg-[#121614] z-10">
                {text.quickAccess}
              </span>
              <div className="flex-grow border-t border-dashed border-slate-200 dark:border-slate-800" />
            </div>

            {/* South Indian Preset Farmers selector */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 text-center">
                {text.quickAccessSub}
              </label>

              <div className="grid grid-cols-1 gap-2">
                {PRESET_FARMERS.map((cur) => (
                  <button
                    type="button"
                    key={cur.farmId}
                    onClick={() => handlePresetSelect(cur)}
                    className="w-full text-left p-3 rounded-xl border border-[#eedfc6]/60 dark:border-slate-800/80 bg-[#fdfaf5]/60 hover:bg-[#faf3e0] dark:bg-[#161a18] dark:hover:bg-[#1a221d] transition duration-150 flex items-center justify-between group gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                          {lang === 'english' ? cur.name.split('•')[0].trim() : cur.name.split('•')[1].trim()}
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 truncate">
                        <span className="font-mono text-amber-600 dark:text-amber-500 font-bold">{cur.farmId}</span>
                        <span>•</span>
                        <span className="truncate">📍 {lang === 'english' ? cur.location.split('•')[0].trim() : cur.location.split('•')[1].trim()}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-[#ea580c] group-hover:translate-x-1 transition duration-150">
                      <span>{lang === 'english' ? 'Login' : 'ಲಾಗಿನ್ / உள்நுழை'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Decorative footer */}
      <footer className="w-full text-center py-4 border-t border-dashed border-[#e5d6be]/50 dark:border-slate-800 z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-slate-400 dark:text-slate-500">
        <div>
          {text.systemFooter}
        </div>
        <div className="px-3 py-1.5 rounded-lg border border-[#ea580c]/15 dark:border-orange-950/40 bg-gradient-to-r from-orange-50/40 to-amber-50/40 dark:from-orange-950/5 dark:to-amber-950/5 text-slate-500 dark:text-slate-400 font-sans font-bold flex items-center gap-2">
          <span>💻 Developed by: <span className="text-[#ea580c] dark:text-[#f59e0b] font-black underline decoration-dashed select-all">Anurag Das</span></span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-mono text-[9px] font-medium">anuragdas.1803@gmail.com</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            {text.activeSensors}
          </span>
          <span className="text-[#ea580c]">|</span>
          <span>Version 3.4.1 (Stable Gini Node)</span>
        </div>
      </footer>

    </div>
  );
}
