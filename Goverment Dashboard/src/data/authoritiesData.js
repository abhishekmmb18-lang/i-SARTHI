// i-SARTHI (ई-सारथी) — 3-Tier Departmental Authority Specifications & Secure Access Control
// 1. NHAI (भारतीय राष्ट्रीय राजमार्ग प्राधिकरण)
// 2. राज्य सड़क प्राधिकरण (State Highway Authorities / PWD)
// 3. नगर निगम एवं स्थानीय शहरी निकाय (Nagar Nigam / Urban Local Bodies)

export const AUTHORITIES = {
    nhai: {
        id: 'nhai',
        code: 'NHAI-NAT',
        nameHindi: 'भारतीय राष्ट्रीय राजमार्ग प्राधिकरण',
        shortName: 'NHAI',
        englishTitle: 'National Highways Authority of India',
        divisionHindi: 'राष्ट्रीय राजमार्ग, एक्सप्रेसवे एवं भारतमाला परियोजना प्रभाग',
        jurisdictionHindi: 'समस्त राष्ट्रीय राजमार्ग (NH), एक्सप्रेसवे, टोल प्लाजा एवं अंतर-राज्यीय गलियारे',
        officerRank: 'मुख्य महाप्रबंधक / परियोजना निदेशक',
        badgeColor: 'bg-blue-900 text-white border-blue-950',
        cardBg: 'from-blue-900/10 via-slate-50 to-white',
        borderAccent: 'border-blue-800',
        accentHex: '#0f274e',
        tag: 'राष्ट्रीय स्तर',
        features: [
            'राष्ट्रीय राजमार्ग (NH-44, NH-48, NH-19) वास्तविक समय सड़क गुणवत्ता निगरानी',
            'गोल्डन क्वाड्रिलेटरल एवं एक्सप्रेसवे ब्लैकस्पॉट स्वचालित न्यूनीकरण',
            'भारी वाणिज्यिक वाहनों हेतु V2V मेश एवं फास्टैग टोल टेलीमेट्री समन्वय',
            '1033 राष्ट्रीय राजमार्ग एम्बुलेंस व हाईवे पेट्रोल गश्ती दल तैनाती'
        ],
        demoCredentials: {
            userId: 'NHAI_HQ_DELHI_01',
            password: 'nhai@2026',
            officerName: 'डॉ. राजेश शर्मा (परियोजना निदेशक, NHAI नई दिल्ली)'
        },
        dashboardRole: 'Administrator',
        jurisdictionFilter: 'National Highways'
    },

    state: {
        id: 'state',
        code: 'STATE-PWD',
        nameHindi: 'राज्य सड़क एवं परिवहन प्राधिकरण',
        shortName: 'राज्य प्राधिकरण (State PWD)',
        englishTitle: 'State Highway Authorities & Public Works Department (PWD)',
        divisionHindi: 'राज्य राजमार्ग (SH), जिला मुख्य मार्ग (MDR) एवं राज्य परिवहन निगम',
        jurisdictionHindi: 'राज्य के भीतर सभी स्टेट हाईवे, अंतर-जिला संपर्क मार्ग एवं राज्य बस बेड़े',
        officerRank: 'अधीक्षण अभियंता (SE) / राज्य परिवहन आयुक्त',
        badgeColor: 'bg-amber-700 text-white border-amber-800',
        cardBg: 'from-amber-600/10 via-slate-50 to-white',
        borderAccent: 'border-amber-600',
        accentHex: '#b45309',
        tag: 'राज्य स्तर',
        features: [
            'राज्य राजमार्गों (State Highways) एवं प्रमुख जिला सड़कों पर गड्ढों का सर्वेक्षण',
            'राज्य सड़क परिवहन निगम (SRTC) बसों में चालक उनींदापन व थकान निगरानी',
            'जिला PWD कार्य आदेश सृजन एवं ठेकेदार मरम्मत प्रगति ट्रैकिंग',
            'राज्य आपातकालीन प्रतिक्रिया केंद्र (112) एवं जिला पुलिस समन्वय'
        ],
        demoCredentials: {
            userId: 'UP_PWD_OFFICER_01',
            password: 'statepwd@2026',
            officerName: 'इंजी. आलोक कुमार वर्मा (अधीक्षण अभियंता, UP PWD लखनऊ)'
        },
        dashboardRole: 'State / District Official',
        jurisdictionFilter: 'State Highways'
    },

    nagarnigam: {
        id: 'nagarnigam',
        code: 'NAGAR-NIGAM',
        nameHindi: 'नगर निगम एवं स्थानीय शहरी निकाय',
        shortName: 'नगर निगम (Municipal Corp)',
        englishTitle: 'Municipal Corporation & Urban Local Bodies (ULB)',
        divisionHindi: 'शहरी सड़कें, वार्ड-स्तरीय बुनियादी ढांचा एवं स्मार्ट सिटी कमांड सेंटर',
        jurisdictionHindi: 'नगरपालिका सीमा, वार्ड सड़कें, आंतरिक गलियां, जलभराव एवं शहरी यातायात चौराहे',
        officerRank: 'नगर आयुक्त / मुख्य नगर अभियंता (Ward Operations)',
        badgeColor: 'bg-emerald-800 text-white border-emerald-900',
        cardBg: 'from-emerald-700/10 via-slate-50 to-white',
        borderAccent: 'border-emerald-700',
        accentHex: '#047857',
        tag: 'स्थानीय शहरी निकाय',
        features: [
            'शहर के आंतरिक वार्डों में सड़क के गड्ढों व टूटी सतह की जियो-टैग्ड पहचान',
            'मानसून जलभराव एवं स्थानीय सड़क अवरोधों का त्वरित निस्तारण',
            'नगर निगम कचरा वाहन एवं शहरी सिटी बस फ्लीट की सेंसर ट्रैकिंग',
            'स्मार्ट सिटी ICCC (इंटीग्रेटेड कमांड एंड कंट्रोल सेंटर) से सीधा समन्वय'
        ],
        demoCredentials: {
            userId: 'NAGAR_NIGAM_OFFICER_GGM',
            password: 'nagarnigam@2026',
            officerName: 'सुश्री प्रियंका यादव (मुख्य नगर अभियंता, वार्ड प्रभाग)'
        },
        dashboardRole: 'Field Inspector',
        jurisdictionFilter: 'Urban & Municipal'
    },

    safety: {
        id: 'safety',
        code: 'FLEET-DMS',
        nameHindi: 'वाहन बेड़ा एवं चालक सुरक्षा प्रभाग',
        shortName: 'Driver DMS',
        englishTitle: 'Commercial Fleet Telemetry & Driver Monitoring System (DMS)',
        divisionHindi: 'वाणिज्यिक वाहन बेड़ा, चालक उनींदापन एवं आपातकालीन सुरक्षा प्रभाग',
        jurisdictionHindi: 'समस्त वाणिज्यिक बस, ट्रक, फ्लीट वाहन एवं इन-केबिन पायलट निगरानी',
        officerRank: 'मुख्य फ्लीट सुरक्षा नियंत्रक (Fleet Safety Controller)',
        badgeColor: 'bg-rose-900 text-white border-rose-950',
        cardBg: 'from-rose-900/10 via-slate-50 to-white',
        borderAccent: 'border-rose-800',
        accentHex: '#9f1239',
        tag: 'चालक एवं फ्लीट सुरक्षा',
        features: [
            'चालक उनींदापन एवं ध्यान भटकाव (Fatigue & Distraction) वास्तविक समय AI पहचान',
            'MQ-3 अल्कोहल सेंसर चेतावनी एवं ओवरस्पीडिंग स्वचालित अलर्ट',
            'आपातकालीन पायलट एसओएस (SOS) अलार्म एवं पैनिक बटन समन्वय',
            'वाहन बेड़ा स्वास्थ्य एवं इन-केबिन AI टेलीमेट्री नोड्स निगरानी'
        ],
        demoCredentials: {
            userId: 'FLEET_SAFETY_OFFICER_01',
            password: 'fleetdms@2026',
            officerName: 'श्री विक्रम सिंह (मुख्य फ्लीट सुरक्षा नियंत्रक)'
        },
        dashboardRole: 'Fleet Safety Inspector',
        jurisdictionFilter: 'Fleet Safety'
    }
};

export const INDIAN_STATES = [
    {
        id: 'UP',
        nameHindi: 'उत्तर प्रदेश (Uttar Pradesh)',
        departmentName: 'उत्तर प्रदेश लोक निर्माण विभाग (UP PWD) एवं UPSRTC',
        headquarters: 'लखनऊ',
        codePrefix: 'UP_PWD',
        demoOfficer: 'इंजी. आलोक कुमार वर्मा (अधीक्षण अभियंता, UP PWD लखनऊ)',
        userId: 'UP_PWD_OFFICER_01',
        password: 'statepwd@2026'
    },
    {
        id: 'MH',
        nameHindi: 'महाराष्ट्र (Maharashtra)',
        departmentName: 'महाराष्ट्र सार्वजनिक बांधकाम विभाग (PWD) एवं MSRTC',
        headquarters: 'मुंबई / पुणे',
        codePrefix: 'MH_PWD',
        demoOfficer: 'इंजी. सचिन पाटिल (अधीक्षण अभियंता, PWD मुंबई)',
        userId: 'MH_PWD_OFFICER_01',
        password: 'statepwd@2026'
    },
    {
        id: 'HR',
        nameHindi: 'हरियाणा (Haryana)',
        departmentName: 'हरियाणा लोक निर्माण विभाग (Haryana PWD B&R) एवं हरियाणा रोडवेज',
        headquarters: 'चंडीगढ़ / गुरुग्राम',
        codePrefix: 'HR_PWD',
        demoOfficer: 'इंजी. राकेश यादव (कार्यकारी अभियंता, PWD गुरुग्राम)',
        userId: 'HR_PWD_OFFICER_01',
        password: 'statepwd@2026'
    },
    {
        id: 'DL',
        nameHindi: 'दिल्ली (Delhi NCR)',
        departmentName: 'दिल्ली लोक निर्माण विभाग (Delhi PWD) एवं DTC',
        headquarters: 'नई दिल्ली',
        codePrefix: 'DL_PWD',
        demoOfficer: 'इंजी. विपिन त्यागी (अधिशासी अभियंता, Delhi PWD)',
        userId: 'DL_PWD_OFFICER_01',
        password: 'statepwd@2026'
    },
    {
        id: 'RJ',
        nameHindi: 'राजस्थान (Rajasthan)',
        departmentName: 'राजस्थान सार्वजनिक निर्माण विभाग (Rajasthan PWD) एवं RSRTC',
        headquarters: 'जयपुर',
        codePrefix: 'RJ_PWD',
        demoOfficer: 'इंजी. विजय सिंह शेखावत (अधीक्षण अभियंता, PWD जयपुर)',
        userId: 'RJ_PWD_OFFICER_01',
        password: 'statepwd@2026'
    },
    {
        id: 'KA',
        nameHindi: 'कर्नाटक (Karnataka)',
        departmentName: 'कर्नाटक लोक निर्माण विभाग (KPWD) एवं KSRTC',
        headquarters: 'बेंगलुरु',
        codePrefix: 'KA_PWD',
        demoOfficer: 'इंजी. मंजूनाथ के. (मुख्य अभियंता, KPWD बेंगलुरु)',
        userId: 'KA_PWD_OFFICER_01',
        password: 'statepwd@2026'
    },
    {
        id: 'GJ',
        nameHindi: 'गुजरात (Gujarat)',
        departmentName: 'गुजरात सड़क एवं भवन विभाग (R&BD) एवं GSRTC',
        headquarters: 'गांधीनगर',
        codePrefix: 'GJ_PWD',
        demoOfficer: 'इंजी. भावेश पटेल (कार्यकारी अभियंता, R&BD गांधीनगर)',
        userId: 'GJ_PWD_OFFICER_01',
        password: 'statepwd@2026'
    },
    {
        id: 'MP',
        nameHindi: 'मध्य प्रदेश (Madhya Pradesh)',
        departmentName: 'मध्य प्रदेश लोक निर्माण विभाग (MP PWD) एवं MPRDC',
        headquarters: 'भोपाल',
        codePrefix: 'MP_PWD',
        demoOfficer: 'इंजी. अनुराग चतुर्वेदी (अधीक्षण अभियंता, PWD भोपाल)',
        userId: 'MP_PWD_OFFICER_01',
        password: 'statepwd@2026'
    },
    {
        id: 'TN',
        nameHindi: 'तमिलनाडु (Tamil Nadu)',
        departmentName: 'तमिलनाडु राजमार्ग विभाग (TN Highways) एवं TNSTC',
        headquarters: 'चेन्नई',
        codePrefix: 'TN_HWY',
        demoOfficer: 'इंजी. एस. सुंदरम (मंडल अभियंता, Highways चेन्नई)',
        userId: 'TN_PWD_OFFICER_01',
        password: 'statepwd@2026'
    },
    {
        id: 'WB',
        nameHindi: 'पश्चिम बंगाल (West Bengal)',
        departmentName: 'पश्चिम बंगाल लोक निर्माण विभाग (WB PWD) एवं SBSTC',
        headquarters: 'कोलकाता',
        codePrefix: 'WB_PWD',
        demoOfficer: 'इंजी. अनिर्बान बनर्जी (कार्यकारी अभियंता, PWD कोलकाता)',
        userId: 'WB_PWD_OFFICER_01',
        password: 'statepwd@2026'
    },
    {
        id: 'PB',
        nameHindi: 'पंजाब (Punjab)',
        departmentName: 'पंजाब लोक निर्माण विभाग (Punjab PWD B&R) एवं पनबस',
        headquarters: 'मोहाली / चंडीगढ़',
        codePrefix: 'PB_PWD',
        demoOfficer: 'इंजी. हरप्रीत सिंह (SE, PWD मोहाली)',
        userId: 'PB_PWD_OFFICER_01',
        password: 'statepwd@2026'
    },
    {
        id: 'BR',
        nameHindi: 'बिहार (Bihar)',
        departmentName: 'बिहार पथ निर्माण विभाग (RCD Bihar) एवं BSRTC',
        headquarters: 'पटना',
        codePrefix: 'BR_RCD',
        demoOfficer: 'इंजी. रवींद्र प्रसाद (कार्यपालक अभियंता, RCD पटना)',
        userId: 'BR_PWD_OFFICER_01',
        password: 'statepwd@2026'
    }
];
