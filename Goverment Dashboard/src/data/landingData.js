// i-SARTHI (ई-सारथी) — National Road Safety & Telemetry Data
// राष्ट्रीय सड़क सुरक्षा एवं यातायात प्रबंधन प्रणाली — लाइव टेलीमेट्री एवं स्थानिक विश्लेषण

export const DEMO_STATS = {
    vehiclesMonitored: '1,248',
    activeAlerts: '18',
    riskZones: '07',
    incidentsToday: '12',
    sosAlerts: '04',
    systemStatus: 'सक्रिय (Active 24x7)',
    lastUpdate: 'कुछ सेकंड पूर्व',
    coverageDistanceKm: '4,850 किमी',
    activeSensors: '3,744 इकाइयाँ'
};

export const CORE_CAPABILITIES = [
    {
        id: 'driver-monitoring',
        code: 'A',
        title: 'चालक सतर्कता निगरानी',
        subtitle: 'AI-सक्षम दृष्टि प्रणाली',
        description: 'सेंसर व कैमरा विश्लेषण द्वारा चालक के उनींदेपन, ध्यान भटकाव एवं असुरक्षित व्यवहार की तत्काल पहचान कर केबिन अलर्ट जारी करता है।',
        metrics: '99.4% सतर्कता शुद्धता',
        badge: 'Edge AI विज़न'
    },
    {
        id: 'v2v-communication',
        code: 'B',
        title: 'वाहन-से-वाहन संचार (V2V)',
        subtitle: 'कम विलंबता मेश नेटवर्क',
        description: 'सड़क पर आगे मौजूद अचानक बाधाओं या आकस्मिक ब्रेक की सूचना पीछे आ रहे वाहनों को 500 मीटर पहले साझा करता है।',
        metrics: '<25ms विलंबता',
        badge: 'DSRC / V2X मेश'
    },
    {
        id: 'hazard-detection',
        code: 'C',
        title: 'सड़क जोखिम पहचान',
        subtitle: 'सतह विश्लेषण एवं ब्लैकस्पॉट',
        description: 'गहरे गड्ढों, मलबे, जलभराव और खराब रोशनी वाले सड़क खंडों को पहचानकर स्थानीय सड़क प्रबंधन को स्वचालित सूचना भेजता है।',
        metrics: '0.8m गहराई संवेदन',
        badge: 'LiDAR + कैमरा'
    },
    {
        id: 'instant-sos',
        code: 'D',
        title: 'त्वरित दुर्घटना चेतावनी',
        subtitle: 'गोल्डन ऑवर आपातकालीन समन्वय',
        description: 'तीव्र टक्कर या वाहन पलटने की स्थिति में IMU शॉक सेंसर द्वारा स्वचालित रूप से सटीक GPS स्थिति के साथ आपातकालीन अलर्ट उत्पन्न होता है।',
        metrics: 'तत्काल GPS ट्रैकिंग',
        badge: 'स्वचालित SOS'
    },
    {
        id: 'sensor-health',
        code: 'E',
        title: 'वाहन स्वास्थ्य एवं सेंसर निगरानी',
        subtitle: 'बहु-सेंसर टेलीमेट्री',
        description: 'वाहन के 6-अक्षीय IMU, LiDAR रेंजफाइंडर, MQ-3 अल्कोहल वेपर डिटेक्टर और तापमान की निरंतर स्थिति प्रदर्शित करता है।',
        metrics: '6-DOF रियल-टाइम फीड',
        badge: 'हार्डवेयर टेलीमेट्री'
    },
    {
        id: 'smart-routing',
        code: 'F',
        title: 'स्मार्ट मार्ग सुरक्षा',
        subtitle: 'जोखिम-आधारित सुरक्षित कॉरिडोर',
        description: 'दुर्घटना-संभावित क्षेत्रों (ब्लैकस्पॉट्स) और भारी यातायात से बचाव हेतु वाणिज्यिक वाहनों को सुरक्षित वैकल्पिक मार्ग सुझाता है।',
        metrics: 'गतिशील जोखिम रेटिंग',
        badge: 'AI रूट सुरक्षा'
    }
];

export const DEMO_ALERTS = [
    {
        id: 'WARN-2026-081',
        time: '17:28 IST',
        location: 'NH-48 किमी 42, मानेसर खंड',
        type: 'सड़क पर गहरा गड्ढा',
        category: 'सड़क अवरोध',
        severity: 'गंभीर',
        status: 'नई चेतावनी',
        vehicleId: 'DL-01-AB-1024',
        lat: 28.3541,
        lng: 76.9388,
        description: 'लेन 2 में 0.8 मीटर चौड़ा और 12 सेमी गहरा गड्ढा दर्ज। तेज गति वाहनों के लिए टायर फटने का जोखिम।',
        recommendedAction: 'रूटिंग डायवर्जन एवं NHAI सड़क रखरखाव टीम को कार्य आदेश अग्रेषित।'
    },
    {
        id: 'WARN-2026-079',
        time: '17:15 IST',
        location: 'NH-44 किमी 118, करनाल बाईपास',
        type: 'चालक सतर्कता चेतावनी',
        category: 'चालक स्थिति',
        severity: 'उच्च',
        status: 'समीक्षा जारी',
        vehicleId: 'HR-26-CV-8890',
        lat: 29.6857,
        lng: 76.9905,
        description: 'वाहन चालक में 4 सेकंड से अधिक लगातार पलकें झपकने और सिर झुकने का पैटर्न (उनींदापन) दर्ज हुआ।',
        recommendedAction: 'केबिन ऑडियो बजर सक्रिय किया गया, निकटतम वे-साइड रेस्ट स्टॉप का सुझाव दिया गया।'
    },
    {
        id: 'WARN-2026-074',
        time: '16:52 IST',
        location: 'NH-19 किमी 204, मथुरा कॉरिडोर',
        type: 'संभावित टक्कर जोखिम',
        category: 'यातायात जोखिम',
        severity: 'गंभीर',
        status: 'समीक्षा जारी',
        vehicleId: 'UP-16-TX-4521',
        lat: 27.4924,
        lng: 77.6737,
        description: 'आगे चल रहे अज्ञात भारी वाहन के अचानक रुकने पर LiDAR ने 15 मीटर से कम की दूरी दर्ज की।',
        recommendedAction: 'V2V मेश द्वारा पीछे आ रहे 8 वाहनों को आपातकालीन मंदी चेतावनी प्रसारित की गई।'
    },
    {
        id: 'WARN-2026-068',
        time: '16:30 IST',
        location: 'NH-48 किमी 88, बावल औद्योगिक क्षेत्र',
        type: 'सड़क की खराब स्थिति',
        category: 'सड़क अवरोध',
        severity: 'मध्यम',
        status: 'कार्रवाई पूर्ण',
        vehicleId: 'MH-12-DE-6743',
        lat: 28.0812,
        lng: 76.5862,
        description: 'निर्माण कार्य सामग्री का सड़क किनारे बिखराव, लेन 3 की चौड़ाई में संकुचन।',
        recommendedAction: 'गश्ती दल द्वारा कोन बैरिकेड स्थापित, लेन डायवर्जन साइनबोर्ड सक्रिय।'
    },
    {
        id: 'WARN-2026-061',
        time: '15:45 IST',
        location: 'NH-44 किमी 55, मुरथल खंड',
        type: 'संभावित सड़क अवरोध',
        category: 'सड़क अवरोध',
        severity: 'सामान्य',
        status: 'कार्रवाई पूर्ण',
        vehicleId: 'DL-01-AB-1024',
        lat: 29.0274,
        lng: 77.0732,
        description: 'शोल्डर लेन में पंचर वाहन खड़ा होने से गति सीमा में 20 किमी/घंटा की कमी दर्ज।',
        recommendedAction: 'हाईवे पेट्रोल 1033 वाहन मौके पर पहुंचा एवं सुरक्षित निकासी सुनिश्चित की गई।'
    },
    {
        id: 'WARN-2026-058',
        time: '14:20 IST',
        location: 'NH-21 किमी 92, बिलासपुर मार्ग',
        type: 'चालक सतर्कता चेतावनी',
        category: 'चालक स्थिति',
        severity: 'मध्यम',
        status: 'कार्रवाई पूर्ण',
        vehicleId: 'HP-12-BB-3341',
        lat: 31.3260,
        lng: 76.7594,
        description: 'घुमावदार मोड़ पर चालक के हाथ स्टीयरिंग से हटने का क्षणिक अंतराल दर्ज हुआ।',
        recommendedAction: 'केबिन हैप्टिक स्टीयरिंग कंपन चेतावनी जारी की गई।'
    }
];

export const DEMO_VEHICLES = [
    {
        id: 'DL-01-AB-1024',
        model: 'वोल्वो FM 420 (वाणिज्यिक कार्गो ट्रेलर)',
        type: 'भारी मालवाहक वाहन',
        speed: 74,
        speedUnit: 'किमी/घंटा',
        speedLimit: 80,
        driverStatus: 'सामान्य एवं सतर्क',
        driverScore: 94,
        imuStatus: 'सामान्य — कंपन स्तर 0.24g (स्थिर)',
        imuDetail: '3-अक्षीय जाइरोस्कोप स्थिर, कोई आकस्मिक मोड़ नहीं',
        lidarStatus: 'सक्रिय — 360° लेज़र परास (45 मीटर)',
        lidarObstacleDistance: 42,
        mq3Status: 'सुरक्षित — 0.01 mg/L (शून्य अल्कोहल स्तर)',
        mq3Safe: true,
        lastPing: '2 सेकंड पूर्व',
        commsStatus: '4G LTE + V2X मेश कनेक्टेड',
        locationName: 'NH-48 किमी 42, मानेसर',
        lat: 28.3541,
        lng: 76.9388
    },
    {
        id: 'HR-26-CV-8890',
        model: 'टाटा एलपीओ 1624 (अंतरराज्यीय एक्सप्रेस बस)',
        type: 'यात्री परिवहन बस',
        speed: 68,
        speedUnit: 'किमी/घंटा',
        speedLimit: 80,
        driverStatus: 'थकान चेतावनी (हल्का उनींदापन)',
        driverScore: 78,
        imuStatus: 'चेतावनी — हल्के क्षणिक स्टीयरिंग विचलन',
        imuDetail: 'लेन बहाव पैटर्न दर्ज, 0.45g झुकाव',
        lidarStatus: 'सक्रिय — सामने परास 38 मीटर',
        lidarObstacleDistance: 38,
        mq3Status: 'सुरक्षित — 0.00 mg/L',
        mq3Safe: true,
        lastPing: '4 सेकंड पूर्व',
        commsStatus: 'V2X रिले सक्रिय',
        locationName: 'NH-44 किमी 118, करनाल बाईपास',
        lat: 29.6857,
        lng: 76.9905
    },
    {
        id: 'UP-16-TX-4521',
        model: 'अशोक लीलैंड कैप्टन 3118 (कंटेनर ट्रक)',
        type: 'मध्यम मालवाहक वाहन',
        speed: 82,
        speedUnit: 'किमी/घंटा',
        speedLimit: 80,
        driverStatus: 'सतर्क',
        driverScore: 88,
        imuStatus: 'आकस्मिक ब्रेक संवेदित (-0.68g)',
        imuDetail: 'तीव्र मंदन दर्ज, ABS सक्रिय',
        lidarStatus: 'चेतावनी — 15 मीटर पर अवरोध संवेदित',
        lidarObstacleDistance: 15,
        mq3Status: 'सुरक्षित — 0.02 mg/L',
        mq3Safe: true,
        lastPing: '1 सेकंड पूर्व',
        commsStatus: 'हॉटस्पॉट ब्रॉडकास्ट सक्रिय',
        locationName: 'NH-19 किमी 204, मथुरा कॉरिडोर',
        lat: 27.4924,
        lng: 77.6737
    },
    {
        id: 'MH-12-DE-6743',
        model: 'भारतबेंज 3528R (पेट्रोलियम टैंकर)',
        type: 'खतरनाक सामग्री वाहन',
        speed: 55,
        speedUnit: 'किमी/घंटा',
        speedLimit: 60,
        driverStatus: 'सतर्क एवं सत्यापित',
        driverScore: 98,
        imuStatus: 'अति-स्थिर — रोल एंगल < 1.2°',
        imuDetail: 'द्रव पदार्थ उछाल स्थिरीकरण सामान्य',
        lidarStatus: 'सक्रिय — बहु-दिशात्मक सुरक्षा क्षेत्र',
        lidarObstacleDistance: 60,
        mq3Status: 'सुरक्षित — 0.00 mg/L (प्रमाणित)',
        mq3Safe: true,
        lastPing: '5 सेकंड पूर्व',
        commsStatus: 'सैटेलाइट नेविगेशन + 4G टेलीमेट्री',
        locationName: 'NH-48 किमी 88, बावल औद्योगिक क्षेत्र',
        lat: 28.0812,
        lng: 76.5862
    }
];

export const MAP_INCIDENTS = [
    {
        id: 'MAP-1',
        title: 'गहरा गड्ढा — लेन 2',
        highway: 'राजमार्ग',
        category: 'सड़क अवरोध',
        type: 'pothole',
        severity: 'गंभीर',
        lat: 28.3541,
        lng: 76.9388,
        location: 'NH-48 किमी 42, मानेसर',
        speedDrop: '-30%',
        sampleVehicle: 'DL-01-AB-1024'
    },
    {
        id: 'MAP-2',
        title: 'चालक उनींदापन अलर्ट',
        highway: 'राजमार्ग',
        category: 'दुर्घटना जोखिम',
        type: 'driver',
        severity: 'उच्च',
        lat: 29.6857,
        lng: 76.9905,
        location: 'NH-44 किमी 118, करनाल',
        speedDrop: '-15%',
        sampleVehicle: 'HR-26-CV-8890'
    },
    {
        id: 'MAP-3',
        title: 'अवरोध — मलबा बिखराव',
        highway: 'राजमार्ग',
        category: 'सड़क अवरोध',
        type: 'debris',
        severity: 'मध्यम',
        lat: 28.0812,
        lng: 76.5862,
        location: 'NH-48 किमी 88, बावल',
        speedDrop: '-10%',
        sampleVehicle: 'MH-12-DE-6743'
    },
    {
        id: 'MAP-4',
        title: 'आकस्मिक मंदी चेतावनी',
        highway: 'राजमार्ग',
        category: 'दुर्घटना जोखिम',
        type: 'collision',
        severity: 'गंभीर',
        lat: 27.4924,
        lng: 77.6737,
        location: 'NH-19 किमी 204, मथुरा',
        speedDrop: '-45%',
        sampleVehicle: 'UP-16-TX-4521'
    },
    {
        id: 'MAP-5',
        title: 'शहरी कंजेशन पॉइंट',
        highway: 'शहरी सड़कें',
        category: 'सड़क अवरोध',
        type: 'congestion',
        severity: 'सामान्य',
        lat: 28.5355,
        lng: 77.2410,
        location: 'आउटर रिंग रोड, नई दिल्ली',
        speedDrop: '-25%',
        sampleVehicle: 'DL-08-CC-2101'
    },
    {
        id: 'MAP-6',
        title: 'राष्ट्रीय राजमार्ग गश्ती वाहन',
        highway: 'आपातकालीन सहायता',
        category: 'आपातकालीन सहायता',
        type: 'patrol',
        severity: 'सामान्य',
        lat: 28.4595,
        lng: 77.0266,
        location: 'गुरुग्राम एक्सप्रेसवे टोल प्लाजा',
        speedDrop: 'सक्रिय पेट्रोलिंग',
        sampleVehicle: 'NHAI-PATROL-14'
    },
    {
        id: 'MAP-7',
        title: 'एकीकृत एम्बुलेंस रिस्पॉन्स यूनिट',
        highway: 'आपातकालीन सहायता',
        category: 'आपातकालीन सहायता',
        type: 'ambulance',
        severity: 'सामान्य',
        lat: 28.1824,
        lng: 76.8156,
        location: 'धारूहेड़ा ट्रॉमा सेंटर बेस',
        speedDrop: 'स्टैंडबाय रेडी',
        sampleVehicle: 'MED-AMB-09'
    }
];

export const ANALYTICS_DATA = {
    dailyAlerts: [
        { day: 'सोमवार', चेतावनियाँ: 14, गड्ढे: 6, चालक_अलर्ट: 5, टक्कर_जोखिम: 3 },
        { day: 'मंगलवार', चेतावनियाँ: 19, गड्ढे: 8, चालक_अलर्ट: 7, टक्कर_जोखिम: 4 },
        { day: 'बुधवार', चेतावनियाँ: 16, गड्ढे: 7, चालक_अलर्ट: 6, टक्कर_जोखिम: 3 },
        { day: 'गुरुवार', चेतावनियाँ: 22, गड्ढे: 10, चालक_अलर्ट: 8, टक्कर_जोखिम: 4 },
        { day: 'शुक्रवार', चेतावनियाँ: 27, गड्ढे: 11, चालक_अलर्ट: 10, टक्कर_जोखिम: 6 },
        { day: 'शनिवार', चेतावनियाँ: 31, गड्ढे: 13, चालक_अलर्ट: 12, टक्कर_जोखिम: 6 },
        { day: 'रविवार', चेतावनियाँ: 18, गड्ढे: 7, चालक_अलर्ट: 7, टक्कर_जोखिम: 4 }
    ],
    categoryBreakdown: [
        { name: 'गड्ढे एवं सड़क सतह', value: 42, color: '#f59e0b' },
        { name: 'चालक उनींदापन व ध्यान', value: 28, color: '#3b82f6' },
        { name: 'संभावित टक्कर जोखिम', value: 18, color: '#ef4444' },
        { name: 'सड़क अवरोध व मलबा', value: 12, color: '#10b981' }
    ],
    vehicleDistribution: [
        { category: 'सुरक्षित परिचालन (>90%)', count: 864, percent: 69 },
        { category: 'मध्यम जोखिम (75-90%)', count: 292, percent: 23 },
        { category: 'सक्रिय सतर्कता (<75%)', count: 92, percent: 8 }
    ]
};
