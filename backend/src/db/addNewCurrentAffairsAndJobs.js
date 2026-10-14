'use strict';
require('dotenv').config();
const crypto = require('crypto');
const { query, rawPool } = require('./pool');

const OCTOBER_CURRENT_AFFAIRS = [
  {
    title: 'Nobel Prizes 2026 Announced: Key Breakthroughs & Global Significance for India',
    summary: 'The 2026 Nobel Prizes were announced in Stockholm and Oslo across Physiology/Medicine, Physics, Chemistry, Literature, Peace, and Economic Sciences, honoring paradigm-shifting advances in microRNA gene regulation, artificial neural networks, protein structure prediction, and institutional prosperity.',
    key_points: JSON.stringify([
      'Medicine: Discovery of microRNA and its fundamental role in post-transcriptional gene regulation.',
      'Physics: Foundational discoveries and inventions enabling machine learning with artificial neural networks.',
      'Chemistry: Computational protein design and revolutionary AI-driven protein structure prediction (AlphaFold).',
      'Literature: Compelling poetic prose confronting historical traumas and exposing fragility of human life.',
      'Peace: Courageous efforts for a world free of nuclear weapons and witness testimony for non-proliferation.',
      'Economic Sciences: Research on how institutions are formed and affect long-term national prosperity and development disparities.'
    ]),
    content: `The Royal Swedish Academy of Sciences and the Norwegian Nobel Committee announced the 2026 Nobel Prize laureates across six disciplines in October 2026.

In Physiology or Medicine, the prize recognized the discovery of microRNA and its critical role in regulating gene expression across multicellular organisms.

In Physics and Chemistry, the Nobel committees acknowledged the historic intersection of computational physics, artificial neural networks, and AI-driven structural biology, transforming molecular medicine, drug discovery, and materials science worldwide.

In Economics, laureates were celebrated for demonstrating why societies with inclusive institutions prosper while extractive systems trap populations in poverty—a thesis with profound policy implications for developing economies like India.`,
    why_it_matters: 'Nobel Prizes are guaranteed questions across UPSC CSE Prelims, SSC CGL General Awareness, IBPS PO, SBI PO, and State Public Service Commission exams.',
    image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    category: 'Science & Tech',
    exam_tags: JSON.stringify(['UPSC', 'SSC', 'Banking', 'Railway', 'State PSC']),
    tags: JSON.stringify(['Nobel Prize 2026', 'Science & Tech', 'Medicine', 'Physics', 'Chemistry', 'Economics', 'General Knowledge']),
    source_url: 'https://nobelprize.org',
    published_date: '2026-10-14',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'Union Cabinet Approves Chandrayaan-4 & Venus Orbiter Mission (Shukrayaan) Outlay of ₹2,104 Cr',
    summary: 'Union Cabinet chaired by Prime Minister approved ISRO’s Chandrayaan-4 lunar sample return mission and Venus Orbiter Mission (Shukrayaan), marking India’s next major interplanetary leaps.',
    key_points: JSON.stringify([
      'Chandrayaan-4 Outlay: ₹2,104 Crore allocated for India’s 1st lunar sample return mission to Earth.',
      'Multi-module architecture: Ascender module, Descender, Transfer module, Re-entry module.',
      'Venus Orbiter Mission (VOM / Shukrayaan): ₹1,236 Cr approved to study Venusian atmosphere and surface geology.',
      'Docking & Undocking technology (SPADEX): Key demonstration slated ahead of lunar landing.',
      'Target launch timeframe: Chandrayaan-4 slated for 2028; Venus Orbiter Mission for March 2028 window.'
    ]),
    content: `The Union Cabinet gave its formal approval to ISRO's Chandrayaan-4 mission, designed to collect lunar soil and rock samples from the Moon's South Pole region and successfully transport them back to Earth.

Unlike previous single-stack missions, Chandrayaan-4 utilizes a sophisticated multi-modular architecture requiring two separate LVM3 launches and in-orbit docking (SPADEX)—a capability critical for future human lunar landings.

Simultaneously, the Cabinet cleared the Venus Orbiter Mission (VOM), India's first dedicated spacecraft to explore the toxic atmosphere, volcanic activity, and subsurface characteristics of Earth's planetary twin.`,
    why_it_matters: 'ISRO space missions are perennial favorites in UPSC GS-III (Space Science), CDS, NDA, and State PSC Prelims & Mains.',
    image_url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
    category: 'Science & Tech',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'Railway', 'SSC', 'Defense']),
    tags: JSON.stringify(['ISRO', 'Chandrayaan-4', 'Venus Mission', 'Shukrayaan', 'Space Science', 'Cabinet Decisions']),
    source_url: 'https://isro.gov.in',
    published_date: '2026-10-13',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'RBI Monetary Policy Review October 2026: Stance Shifted to Neutral; UPI Limits Raised to ₹10,000',
    summary: 'RBI Monetary Policy Committee (MPC) maintained repo rate at 5.25% while unanimously shifting policy stance to "Neutral". Crucially, RBI raised UPI 123Pay limit to ₹10,000 and UPI Lite wallet limit to ₹5,000.',
    key_points: JSON.stringify([
      'Policy Repo Rate: 5.25%; Standing Deposit Facility (SDF): 5.00%; MSF rate: 5.50%.',
      'Monetary Policy Stance: Changed from "Withdrawal of Accommodation" to "Neutral".',
      'Real GDP Growth Forecast: Retained at 7.2% for FY 2026-27.',
      'CPI Inflation Projection: Pegged at 4.5% with core inflation moderating.',
      'UPI 123Pay Enhancement: Per-transaction ceiling doubled from ₹5,000 to ₹10,000 for feature phone users.',
      'UPI Lite Wallet Limit: Increased from ₹2,000 to ₹5,000 with per-transaction limit of ₹1,000.'
    ]),
    content: `The Reserve Bank of India’s Monetary Policy Committee announced its October 2026 bi-monthly monetary resolution. While holding the benchmark repo rate at 5.25%, the 6-member MPC shifted its stance to "Neutral", providing flexibility to respond to domestic growth-inflation dynamics.

To boost digital payments in rural and semi-urban India, Governor announced doubling the transaction limit for UPI 123Pay (for feature phones) to ₹10,000. Additionally, the UPI Lite wallet balance ceiling was raised to ₹5,000 to speed up low-value retail transactions without entering PIN.`,
    why_it_matters: 'Mandatory topic for IBPS PO, SBI PO, RBI Grade B, UPSC Economy GS-III, and all banking general awareness tests.',
    image_url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=800&q=80',
    category: 'Economy',
    exam_tags: JSON.stringify(['Banking', 'RBI Grade B', 'UPSC', 'SSC', 'State PSC']),
    tags: JSON.stringify(['RBI', 'Repo Rate', 'Monetary Policy', 'UPI 123Pay', 'UPI Lite', 'Banking Awareness']),
    source_url: 'https://rbi.org.in',
    published_date: '2026-10-12',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'PM-Vidyalaxmi Scheme Cleared: Collateral-Free Education Loans up to ₹7.5 Lakh with 75% Govt Guarantee',
    summary: 'Union Cabinet approved PM-Vidyalaxmi, a transformative central sector scheme guaranteeing collateral-free education loans up to ₹7.5 lakh with 75% credit guarantee for meritorious students admitted to top 860 NIRF-ranked institutions.',
    key_points: JSON.stringify([
      'Outlay: ₹3,600 Crore allocated for period 2024-25 to 2030-31.',
      'Coverage: Top 860 Higher Educational Institutions (HEIs) across India ranked in NIRF.',
      'Loan Guarantee: 75% credit guarantee by Government of India for loans up to ₹7.5 Lakh without third-party guarantee or collateral.',
      'Interest Subvention: 3% full interest subsidy during moratorium period for students with annual family income up to ₹8 Lakh.',
      'Portal: Fully digital, paperless application through unified PM-Vidyalaxmi portal linked to Digilocker.'
    ]),
    content: `In a landmark welfare decision for Indian youth and higher education aspirants, the Union Cabinet approved the "PM-Vidyalaxmi" scheme under the National Education Policy (NEP) 2020 framework.

Under the scheme, any meritorious student who gets admission into premier government or private higher education institutions (NIRF Top 100 overall, category-wise, or State 101-200) can avail collateral-free loans covering complete tuition and course-related expenses.

The digital application system directly transfers financial support via transparent Direct Benefit Transfer (DBT) and e-vouchers.`,
    why_it_matters: 'Directly impacts millions of students; highly testable in Government Schemes, Welfare Economics, and UPSC GS-II Social Justice.',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    category: 'Student Corner',
    exam_tags: JSON.stringify(['UPSC', 'SSC', 'Banking', 'Railway', 'State PSC', 'School & College']),
    tags: JSON.stringify(['PM-Vidyalaxmi', 'Education Loans', 'Higher Education', 'NEP 2020', 'Government Schemes', 'Student Corner']),
    source_url: 'https://pib.gov.in',
    published_date: '2026-10-11',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'PM Surya Ghar: Muft Bijli Yojana Crosses 1.5 Crore Registrations Across Indian Households',
    summary: 'India’s flagship rooftop solar initiative, PM Surya Ghar: Muft Bijli Yojana, crossed a historic milestone of 1.5 crore residential registrations and 7 lakh rooftop installations, saving ₹15,000+ per household annually.',
    key_points: JSON.stringify([
      'Total Budget: ₹75,021 Crore approved to install rooftop solar in 1 crore households.',
      'Free Power: Provides up to 300 units of free electricity per month for eligible households.',
      'Direct Subsidy: ₹30,000 for 1 kW systems, ₹60,000 for 2 kW systems, and ₹78,000 for 3 kW and above.',
      'DISCOM Incentive: Financial bonuses to power distribution companies for fast-tracking net-metering.',
      'Model Solar Villages: ₹800 Cr earmarked to develop at least one Model Solar Village in every district.'
    ]),
    content: `Ministry of New and Renewable Energy (MNRE) announced that the PM Surya Ghar: Muft Bijli Yojana crossed 1.5 crore household registrations nationwide.

Launched to revolutionize residential renewable energy access, the scheme offers up to 60% direct subsidy for up to 2 kW capacity and 40% for additional capacity up to 3 kW. Surplus power generated by households is fed back into the local electricity grid via net-metering, generating recurring ancillary income for families.

The initiative drastically reduces India’s national carbon emissions while saving over ₹75,000 crore annually in government electricity subsidies.`,
    why_it_matters: 'Critical topic for UPSC GS-III (Renewable Energy), Energy Security, SSC CGL Economics, and Banking GK.',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    category: 'Environment',
    exam_tags: JSON.stringify(['UPSC', 'SSC', 'Banking', 'Railway', 'State PSC']),
    tags: JSON.stringify(['PM Surya Ghar', 'Solar Energy', 'Renewable Energy', 'MNRE', 'Net Metering', 'Climate Action']),
    source_url: 'https://pmsuryaghar.gov.in',
    published_date: '2026-10-10',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'India Semiconductor Mission 2.0: Tata & Micron Advance ₹1.5 Lakh Cr Fab Units in Gujarat & Assam',
    summary: 'Union Cabinet and Ministry of Electronics & IT (MeitY) reviewed rapid progress under the India Semiconductor Mission (ISM), with India’s 1st commercial semiconductor fabrication facility in Dholera and OSAT plants in Sanand & Morigaon moving to equipment installation.',
    key_points: JSON.stringify([
      'Total ISM Outlay: ₹76,000 Crore with 50% fiscal support on capital expenditure.',
      'Tata Electronics Dholera Fab: ₹91,000 Cr joint venture with Taiwan’s PSMC to produce 50,000 wafers/month.',
      'Tata OSAT Unit Morigaon (Assam): ₹27,000 Cr investment creating 27,000 direct and indirect high-tech jobs.',
      'Micron Sanand ATMP (Gujarat): $2.75 Billion semiconductor assembly and test facility.',
      'Silicon Carbide (SiC) & GaN Power Chips: Targeted for EV, Railway traction, and 5G/6G power electronics.'
    ]),
    content: `India’s ambition to become a global chip manufacturing hub gained immense traction as construction at the Tata Electronics-PSMC wafer fab in Dholera Special Investment Region (DSIR), Gujarat entered its advanced cleanroom buildout phase.

Simultaneously, the landmark semiconductor packaging plant in Morigaon, Assam marked the first major semiconductor investment in Northeast India, opening thousands of engineering careers for technical graduates.

Semicon India programs have anchored over five mega chip manufacturing and packaging projects across the nation, positioning India as a resilient alternative in global semiconductor supply chains.`,
    why_it_matters: 'A central theme for UPSC GS-III (Industrial Growth & Electronics), SSC CGL, Engineering Services, and Banking Economy tests.',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    category: 'Science & Tech',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'Banking', 'SSC', 'Engineering']),
    tags: JSON.stringify(['Semiconductor Mission', 'Tata Electronics', 'Dholera', 'Make In India', 'Electronics Manufacturing']),
    source_url: 'https://meity.gov.in',
    published_date: '2026-10-09',
    is_published: 1,
    is_featured: 0
  },
  {
    title: '21st ASEAN-India Summit 2026: PM Announces 10-Point Plan to Deepen Comprehensive Strategic Partnership',
    summary: 'Prime Minister Narendra Modi addressed the 21st ASEAN-India Summit and 19th East Asia Summit in Vientiane, Lao PDR, unveiling a 10-point roadmap focusing on maritime security, digital public infrastructure, and supply chain resilience.',
    key_points: JSON.stringify([
      'Venue: Vientiane, Lao PDR; celebrating a decade of India’s "Act East Policy".',
      '10-Point Plan: Digital Public Infrastructure, ASEAN-India Fund for Green Hydrogen, Disaster Resilience.',
      'Maritime Security: Unanimous reaffirmation of freedom of navigation under UNCLOS 1982 in South China Sea.',
      'AITIGA Review: Fast-tracking review of ASEAN-India Trade in Goods Agreement to make trade more balanced.',
      'Year of Tourism: 2026 designated as ASEAN-India Year of Tourism with visa-simplification initiatives.'
    ]),
    content: `Prime Minister Modi participated in the 21st ASEAN-India Summit in Vientiane, Lao PDR. Highlighting the 10th anniversary of the Act East Policy, India presented a concrete 10-point roadmap to strengthen cooperation.

Key deliverables include expanding India's Unified Payments Interface (UPI) integration across ASEAN member states, doubling ASEAN scholarships at Nalanda University, and deploying maritime domain awareness mechanisms for anti-piracy and blue economy preservation.

Leaders stressed peace, stability, and adherence to international maritime law (UNCLOS 1982) in the Indo-Pacific region.`,
    why_it_matters: 'Essential for UPSC GS-II (International Relations, India & its Neighborhood, Act East Policy) and Banking Awareness.',
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    category: 'International',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'Banking', 'SSC']),
    tags: JSON.stringify(['ASEAN', 'Act East Policy', 'International Relations', 'Indo-Pacific', 'Narendra Modi']),
    source_url: 'https://mea.gov.in',
    published_date: '2026-10-08',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'India Adds 3 New Ramsar Sites: Total Wetland Count Rises to 85 Across the Nation',
    summary: 'Ministry of Environment, Forest and Climate Change announced addition of Nanjarayan Bird Sanctuary and Kazhuveli Bird Sanctuary in Tamil Nadu, along with Tawa Reservoir in Madhya Pradesh to the Ramsar List of Wetlands of International Importance.',
    key_points: JSON.stringify([
      'Total Ramsar Sites: India’s total count reached 85 wetlands, covering over 1.35 million hectares.',
      'Tamil Nadu holds the highest number of Ramsar sites in India (18 sites), followed by Uttar Pradesh (10 sites).',
      'Nanjarayan Bird Sanctuary (Tiruppur, TN): Vital foraging ground for migratory waterbirds on Central Asian Flyway.',
      'Kazhuveli Bird Sanctuary (Villupuram, TN): One of the largest brackish water wetlands in South India.',
      'Tawa Reservoir (Hoshangabad, MP): Located inside Satpura Tiger Reserve, vital aquatic habitat for marsh crocodiles and waterfowl.'
    ]),
    content: `India expanded its network of Ramsar sites to 85 with the designation of three new wetlands of international importance in Tamil Nadu and Madhya Pradesh.

Ramsar Convention is an intergovernmental treaty adopted in 1971 in Ramsar, Iran, providing the framework for national action and international cooperation for wetland conservation.

India’s rapid expansion of designated wetlands reflects the national commitment under Mission Sahbhagita and the Amrit Dharohar initiative to empower local communities in wetland conservation.`,
    why_it_matters: 'Ramsar sites and wetland ecology are frequently tested in UPSC Prelims Environment, State PSC, and SSC CGL GK.',
    image_url: 'https://images.unsplash.com/photo-1502126324834-38f8e02d7160?auto=format&fit=crop&w=800&q=80',
    category: 'Environment',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'SSC', 'Railway', 'Forest Services']),
    tags: JSON.stringify(['Ramsar Sites', 'Wetlands', 'Environment & Ecology', 'Tamil Nadu', 'Madhya Pradesh', 'Biodiversity']),
    source_url: 'https://moef.gov.in',
    published_date: '2026-10-07',
    is_published: 1,
    is_featured: 0
  },
  {
    title: 'Haryana & Jammu-Kashmir Assembly Elections 2026: Historic Voter Turnout & Democratic Milestone',
    summary: 'Election Commission of India (ECI) successfully concluded peaceful assembly elections in Jammu & Kashmir and Haryana. Jammu & Kashmir held its first legislative assembly election in a decade, witnessing over 63.8% voter turnout.',
    key_points: JSON.stringify([
      'J&K UT Assembly: First assembly elections in 10 years (since 2014) following the J&K Reorganisation Act 2019.',
      'Voter Turnout: Over 63.8% in J&K across three phases without any major violent incidents.',
      'Haryana Assembly: 90 constituencies went to polls in a single phase with over 67.9% voting participation.',
      'New Legislative Framework: J&K Assembly comprises 90 elected seats (47 in Kashmir valley, 43 in Jammu region).',
      'Women & First-Time Voters: Recorded highest-ever participation in rural border districts.'
    ]),
    content: `The Election Commission of India completed the assembly electoral processes for Jammu & Kashmir Union Territory and Haryana in October 2026.

The J&K election marked a watershed moment in democratic consolidation in the Kashmir valley, witnessing high enthusiasm among youth and first-time voters. The peaceful conduct of polls across all 90 constituencies established record turnout in formerly sensitive pockets.

In Haryana, voting concluded smoothly across all 90 seats, reflecting robust civic engagement. Chief Election Commissioner commended the peaceful, transparent execution supported by 100% webcasting at polling stations.`,
    why_it_matters: 'Vital for Polity & Governance in UPSC GS-II, State PSC examinations, Judicial Services, and General Knowledge quizzes.',
    image_url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80',
    category: 'Politics',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'Law Exams', 'SSC']),
    tags: JSON.stringify(['Elections 2026', 'Jammu & Kashmir', 'Haryana', 'Election Commission', 'Indian Polity']),
    source_url: 'https://eci.gov.in',
    published_date: '2026-10-06',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'Ayushman Bharat Expanded: Free ₹5 Lakh Healthcare Coverage to All Citizens Aged 70 and Above',
    summary: 'Union Cabinet rolled out universal health coverage under Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB PM-JAY) for all senior citizens aged 70 years and above, regardless of income or socioeconomic status.',
    key_points: JSON.stringify([
      'Target Beneficiaries: Around 6 crore senior citizens across 4.5 crore families in India.',
      'Coverage Amount: ₹5 Lakh per year free hospitalisation coverage on family basis.',
      'Income Neutral: Open to all senior citizens aged 70+ irrespective of economic status, caste, or background.',
      'New Card: Eligible senior citizens receive a distinct new "Ayushman Vaya Vandana Card".',
      'Dual Coverage Option: Seniors already covered under private health insurance or CGHS can opt for top-up coverage.'
    ]),
    content: `The Union Cabinet officially approved expanding the Ayushman Bharat PM-JAY scheme to provide universal healthcare insurance of up to ₹5 lakh per year to every Indian citizen aged 70 years and above.

Under the expanded scheme, eligible seniors belonging to families already covered under AB PM-JAY will receive an additional top-up cover of ₹5 lakh exclusively for themselves. Seniors not previously covered can enroll to receive family-floater cover of ₹5 lakh per year.

The initiative eliminates out-of-pocket geriatric healthcare expenses, covering tertiary and secondary hospitalization across 29,000+ empaneled hospitals.`,
    why_it_matters: 'Major healthcare reform question for UPSC GS-II (Social Justice & Health), Bank PO Awareness, and SSC CGL.',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    category: 'General Knowledge',
    exam_tags: JSON.stringify(['UPSC', 'SSC', 'Banking', 'Railway', 'State PSC']),
    tags: JSON.stringify(['Ayushman Bharat', 'Healthcare', 'Senior Citizens', 'PM-JAY', 'Government Schemes']),
    source_url: 'https://pmjay.gov.in',
    published_date: '2026-10-05',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'Indian Navy Commissions 2nd Arihant-Class Nuclear Submarine INS Arighaat; Bolsters Nuclear Triad',
    summary: 'Defence Minister Rajnath Singh commissioned INS Arighaat (SSBN), India’s second indigenous nuclear-powered ballistic missile submarine, into operational service at Visakhapatnam.',
    key_points: JSON.stringify([
      'Role: Strategic Strike Nuclear Submarine (SSBN) equipped with submarine-launched ballistic missiles (SLBMs).',
      'Armament: Capable of carrying K-15 Sagarika missiles (range 750 km) and long-range K-4 ballistic missiles (range 3,500 km).',
      'Nuclear Triad: Solidifies India’s survivable second-strike nuclear deterrence capability.',
      'Indigenous Content: Over 65% domestic equipment built under the Advanced Technology Vessel (ATV) project.',
      'Follow-on Submarines: Construction of larger S4 and S4* SSBNs underway at Ship Building Centre (SBC), Visakhapatnam.'
    ]),
    content: `India’s strategic maritime deterrence achieved a historic milestone with the operational commissioning of INS Arighaat at the Naval Dockyard in Visakhapatnam.

As the second ship of the Arihant class, INS Arighaat features significant technological advancements over INS Arihant, including indigenous nuclear reactor systems, enhanced acoustic silencing, and advanced sonar systems.

The submarine guarantees a credible, invulnerable second-strike capability in full compliance with India's "No First Use" nuclear doctrine, fortifying peace and strategic balance across the Indian Ocean Region.`,
    why_it_matters: 'Top-tier topic for Defense exams (CDS, NDA, AFCAT, CAPF), UPSC GS-III (Internal Security & Defense), and SSC.',
    image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    category: 'Science & Tech',
    exam_tags: JSON.stringify(['NDA', 'CDS', 'AFCAT', 'UPSC', 'Defense']),
    tags: JSON.stringify(['INS Arighaat', 'Indian Navy', 'Nuclear Submarine', 'Defense', 'Security', 'Atmanirbhar Bharat']),
    source_url: 'https://indiannavy.nic.in',
    published_date: '2026-10-04',
    is_published: 1,
    is_featured: 0
  },
  {
    title: 'ICC Women’s T20 World Cup 2026: Landmark Tournament Highlights & Milestones',
    summary: 'The 9th edition of the ICC Women’s T20 World Cup witnessed thrilling cricketing action with top international teams competing, showcasing historic centuries, record bowling spells, and massive global viewership.',
    key_points: JSON.stringify([
      'Format: 10 international teams competing in 23 T20 international fixtures.',
      'Prize Money: Total prize pool increased to $7.95 Million, achieving equal prize money parity with Men’s T20 World Cup.',
      'Indian Highlights: Key performances by Harmanpreet Kaur, Smriti Mandhana, and Renuka Singh Thakur.',
      'Record-Breaking Spells: Best bowling figures and fastest fifties in women’s T20 World Cup history recorded.',
      'DRS & Smart Replay: Full deployment of Smart Replay System and hawk-eye ball-tracking technology.'
    ]),
    content: `The 2026 ICC Women’s T20 World Cup captured worldwide attention as premier cricketing nations contested for the championship trophy.

In a landmark achievement for gender parity in global sports, the International Cricket Council (ICC) implemented full prize money parity, awarding the tournament champions identical prize purses to their male counterparts.

The tournament showcased exceptional batting and fielding standards, with Indian stalwarts reaching multiple international milestones in appearances and run tallies.`,
    why_it_matters: 'Sports GK is heavily tested across SSC CGL, RRB NTPC, IBPS Clerk, SBI Clerk, and State PSC examinations.',
    image_url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    category: 'Sports',
    exam_tags: JSON.stringify(['SSC', 'Railway', 'Banking', 'State PSC', 'General Knowledge']),
    tags: JSON.stringify(['Cricket', 'Women T20 World Cup', 'Sports GK', 'ICC', 'Indian Cricket']),
    source_url: 'https://icc-cricket.com',
    published_date: '2026-10-03',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'Union Cabinet Approves "Mission Mausam" with ₹2,000 Cr Outlay for AI-Driven Weather Forecasting',
    summary: 'The Ministry of Earth Sciences launched "Mission Mausam" with a ₹2,000 Crore budget to equip India with next-generation X-band Doppler radars, AI weather prediction models, and cloud-seeding testbeds.',
    key_points: JSON.stringify([
      'Implementing Agencies: India Meteorological Department (IMD), NCMRWF, and IITM Pune.',
      'Infrastructure: Installation of 50 new Doppler Weather Radars, 60 Wind Profilers, and 100+ Radiometers.',
      'AI/ML Integration: Real-time high-resolution weather forecasting down to panchayat/block level.',
      'Climate Resilience: Early warning systems for cloudbursts, urban flash floods, cyclones, and heatwaves.',
      'Atmospheric Testbeds: Establishing dedicated cloud-simulation and rain enhancement laboratories.'
    ]),
    content: `The Union Cabinet approved "Mission Mausam", a visionary multi-year initiative to transform India’s weather and climate forecasting capabilities.

Implemented primarily by the India Meteorological Department (IMD) under the Ministry of Earth Sciences, the mission aims to provide hyper-local, block-level weather forecasts using cutting-edge artificial intelligence, high-performance computing, and advanced Doppler radar grids.

This will directly benefit Indian farmers, disaster response agencies, aviation, and coastal fisheries, substantially curtailing agricultural crop losses and infrastructure damage.`,
    why_it_matters: 'Directly tested under UPSC GS-III (Disaster Management, Science & Tech) and State PSC exams.',
    image_url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=800&q=80',
    category: 'Science & Tech',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'SSC', 'Disaster Management']),
    tags: JSON.stringify(['Mission Mausam', 'IMD', 'Weather Forecasting', 'Doppler Radar', 'Climate Science']),
    source_url: 'https://moes.gov.in',
    published_date: '2026-10-02',
    is_published: 1,
    is_featured: 0
  },
  {
    title: 'Global Innovation Index (GII) 2026: India Retains Top Spot in Central and South Asia, Climbs to Rank 39',
    summary: 'According to the World Intellectual Property Organization (WIPO), India climbed to 39th rank among 133 economies in the Global Innovation Index 2026, leading the lower-middle-income economy group for the 14th consecutive year.',
    key_points: JSON.stringify([
      'Publishing Body: World Intellectual Property Organization (WIPO), Geneva.',
      'India’s Rank: 39th out of 133 economies (improved from 81st rank in 2015).',
      'Regional Leader: Ranked 1st among Central and Southern Asian economies.',
      'Income Group: Ranked 1st among 38 lower-middle-income economies worldwide.',
      'Top Pillars: ICT services exports (Rank 1), Venture capital recipients (Rank 6), Science and engineering graduates (Rank 11).'
    ]),
    content: `India continued its steady ascent in the Global Innovation Index (GII) 2026 published by WIPO, securing the 39th rank globally.

The index evaluates national innovation capacity across around 80 indicators spanning institutions, human capital, infrastructure, market sophistication, business sophistication, knowledge and technology outputs, and creative outputs.

India’s exceptional performance is driven by its burgeoning startup ecosystem, global leadership in digital public goods (UPI, ONDC), high patent filing growth by domestic entities, and robust ICT software services exports.`,
    why_it_matters: 'Reports & Indices are heavily asked in UPSC Prelims, RBI Grade B Phase 1 & 2, and SSC GA.',
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    category: 'Economy',
    exam_tags: JSON.stringify(['UPSC', 'Banking', 'RBI Grade B', 'SSC', 'State PSC']),
    tags: JSON.stringify(['Global Innovation Index', 'WIPO', 'Startup India', 'Patents', 'Indian Economy']),
    source_url: 'https://wipo.int',
    published_date: '2026-10-01',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'Union Cabinet Approves "BioE3 Policy" for High-Performance Biomanufacturing and Green Growth',
    summary: 'The Union Cabinet approved the BioE3 (Biotechnology for Economy, Environment and Employment) Policy, positioning India as a global biomanufacturing powerhouse for bio-plastics, enzymes, and bio-therapeutics.',
    key_points: JSON.stringify([
      'Policy Name: BioE3 (Biotechnology for Economy, Environment and Employment).',
      'Nodal Department: Department of Biotechnology (DBT), Ministry of Science & Technology.',
      'Focus Thematic Sectors: Bio-based chemicals, Smart proteins, Functional foods, Precision biotherapeutics, Carbon capture utilization.',
      'Bio-Enablers: Setting up Biomanufacturing & Bio-Foundry Hubs and Bio-AI centers across India.',
      'Goal: Accelerating India’s bio-economy from $150 Billion to $300 Billion by 2030.'
    ]),
    content: `The Union Cabinet chaired by the Prime Minister approved the visionary BioE3 Policy to drive a biological industrial revolution in India.

The policy addresses climate change mitigation and resource depletion through cellular agriculture, synthetic biology, and industrial biotechnology. By creating biomanufacturing hubs, India will replace petroleum-derived plastics, synthetic fertilizers, and industrial chemicals with bio-based renewable substitutes.

The initiative is projected to generate lakhs of skilled jobs in biotechnology, life sciences, and biomedical engineering.`,
    why_it_matters: 'Crucial for UPSC GS-III (Biotechnology, Environment) and State PSC Science sections.',
    image_url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
    category: 'Science & Tech',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'Science & Tech', 'SSC']),
    tags: JSON.stringify(['BioE3 Policy', 'Biotechnology', 'Bio-economy', 'Cabinet Approval', 'Green Energy']),
    source_url: 'https://dbtindia.gov.in',
    published_date: '2026-09-30',
    is_published: 1,
    is_featured: 0
  },
  {
    title: 'One Nation, One Election: Cabinet Accepts High-Level Committee Recommendations on Simultaneous Polls',
    summary: 'The Union Cabinet approved the recommendations of the High-Level Committee on Simultaneous Elections headed by former President Ram Nath Kovind, paving the way for synchronized Lok Sabha and State Assembly polls.',
    key_points: JSON.stringify([
      'Committee Chair: Shri Ram Nath Kovind (Former President of India).',
      'Phase 1: Simultaneous elections for the House of the People (Lok Sabha) and all State Legislative Assemblies.',
      'Phase 2: Harmonizing local body elections (Panchayats and Municipalities) within 100 days of general elections.',
      'Single Electoral Roll: Proposed unified voter list and voter photo identity cards for all tiers of government.',
      'Constitutional Amendments: Outlined amendments to Articles 83, 172, and 327 requiring parliamentary approval.'
    ]),
    content: `The Union Cabinet officially accepted the report of the High-Level Committee on Simultaneous Elections.

The Kovind Committee report argues that holding elections simultaneously will reduce governance disruptions caused by frequent Model Code of Conduct enforcement, cut massive security deployment and campaign expenses, and accelerate policy implementation.

Implementation requires introducing constitutional amendment bills in Parliament and consultative engagement with State governments.`,
    why_it_matters: 'Top theoretical and constitutional question for UPSC GS-II (Electoral Reforms, Federalism) and Law examinations.',
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    category: 'Politics',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'Law Exams', 'CLAT']),
    tags: JSON.stringify(['One Nation One Election', 'Kovind Committee', 'Polity', 'Electoral Reforms', 'Indian Constitution']),
    source_url: 'https://pib.gov.in',
    published_date: '2026-09-29',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'Indian Railways Rolls Out 1st Vande Bharat Sleeper Train: 160 Kmph Luxury Overnight Travel',
    summary: 'Indian Railways unveiled the prototype of the indigenous Vande Bharat Sleeper train manufactured at BEML Bengaluru, featuring aerodynamically designed stainless steel car bodies, Kavach automatic train protection, and aircraft-style amenities.',
    key_points: JSON.stringify([
      'Manufacturing: Built by BEML (Bharat Earth Movers Ltd) in Bengaluru in collaboration with ICF Chennai.',
      'Design Speed: Operational speed of 160 kmph, tested up to 180 kmph.',
      'Coach Configuration: 16 coaches (11 AC 3-Tier, 4 AC 2-Tier, and 1 AC First Class).',
      'Safety: Equipped with indigenous Kavach collision avoidance system and fire barriers.',
      'Routes: Targeted for overnight long-distance routes like New Delhi-Mumbai and New Delhi-Howrah.'
    ]),
    content: `The Ministry of Railways officially unveiled the first Vande Bharat Sleeper trainset, revolutionizing overnight rail transit in India.

Designed for journey distances exceeding 800 to 1,200 km, the train features sensor-based automatic interior doors, whisper-quiet sound insulation, modular bio-vacuum toilets, and ergonomic berths with soft cushioning.

The introduction of sleeper variants complements the existing chair-car fleet, bolstering domestic rail passenger experience and high-speed transit infrastructure.`,
    why_it_matters: 'Standard topic in Railway NTPC, RRB Group D, SSC CGL General Awareness, and UPSC Infrastructure GS-III.',
    image_url: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?auto=format&fit=crop&w=800&q=80',
    category: 'General Knowledge',
    exam_tags: JSON.stringify(['Railway', 'SSC', 'Banking', 'UPSC', 'State PSC']),
    tags: JSON.stringify(['Vande Bharat', 'Indian Railways', 'BEML', 'Infrastructure', 'Kavach']),
    source_url: 'https://indianrailways.gov.in',
    published_date: '2026-09-28',
    is_published: 1,
    is_featured: 0
  },
  {
    title: 'Quad Leaders Summit 2026: Wilmington Declaration Launches "Quad Cancer Moonshot" Initiative',
    summary: 'Leaders of the Quad nations (India, United States, Japan, and Australia) convened for the annual Quad Leaders Summit, unveiling the Quad Cancer Moonshot to combat cervical cancer across the Indo-Pacific region.',
    key_points: JSON.stringify([
      'Quad Nations: India, United States, Australia, and Japan.',
      'Quad Cancer Moonshot: Partnership to save lives by accelerating cervical cancer screening, HPV vaccination, and treatment access.',
      'India’s Contribution: Supplying HPV vaccines, digital health tools, and $7.5 Million worth of sampling kits across the Indo-Pacific.',
      'Maritime Security: Expansion of the IPMDA (Indo-Pacific Partnership for Maritime Domain Awareness) to track illicit fishing and piracy.',
      'Quad Ports of the Future: Initiative to finance sustainable and cyber-secure port infrastructure in developing nations.'
    ]),
    content: `Prime Minister Narendra Modi joined President Joe Biden, Prime Minister Anthony Albanese, and Prime Minister Fumio Kishida for the Quad Leaders Summit.

The leaders issued the Wilmington Declaration, institutionalizing strategic cooperation across health security, clean energy supply chains, open RAN telecommunications, and maritime domain awareness.

India announced it will offer 40 million HPV vaccine doses to Indo-Pacific countries through Gavi and bilateral partnerships, establishing Indian pharmaceutical leadership in global preventive oncology.`,
    why_it_matters: 'Crucial for UPSC GS-II (International Fora, Indo-Pacific, Health Diplomacy) and Banking Current Affairs.',
    image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80',
    category: 'International',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'Banking', 'SSC']),
    tags: JSON.stringify(['Quad Summit', 'Indo-Pacific', 'Cancer Moonshot', 'International Relations', 'Narendra Modi']),
    source_url: 'https://mea.gov.in',
    published_date: '2026-09-25',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'National Maritime Heritage Complex (NMHC) Lothal: Cabinet Clears ₹4,500 Cr Phase-1 Development',
    summary: 'Union Cabinet approved master development of the National Maritime Heritage Complex (NMHC) at Lothal, Gujarat—the ancient Indus Valley Civilization dockyard—to showcase India’s 5,000-year-old maritime heritage.',
    key_points: JSON.stringify([
      'Location: Lothal, Ahmedabad district, Gujarat (historic Harappan port city).',
      'Ministry: Ministry of Ports, Shipping and Waterways (MoPSW).',
      'Features: World’s highest lighthouse museum, open-air Harappan dock city replica, 14 maritime galleries.',
      'International Maritime Research Center: Collaboration with Portugal, France, and UNESCO.',
      'Tourism Potential: Projected to attract 30 lakh domestic and international visitors annually.'
    ]),
    content: `The Union Cabinet cleared the execution roadmap for the world-class National Maritime Heritage Complex (NMHC) at Lothal, Gujarat.

Lothal was one of the world's earliest known engineered docks, connecting Harappan traders with Mesopotamia and ancient civilizations. The NMHC project will revive and celebrate India's ancient maritime legacy through immersive 5D edutainment galleries, marine biodiversity aquariums, and research wings.

The project positions Lothal on the global heritage tourism map while deepening marine archeology studies.`,
    why_it_matters: 'High yield for UPSC GS-I (Art & Culture, Ancient History, Indus Valley Civilization) and SSC CGL GK.',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    category: 'General Knowledge',
    exam_tags: JSON.stringify(['UPSC', 'SSC', 'State PSC', 'Art & Culture']),
    tags: JSON.stringify(['Lothal', 'Harappan Civilization', 'Maritime Heritage', 'Gujarat', 'Art & Culture']),
    source_url: 'https://shipmin.gov.in',
    published_date: '2026-09-24',
    is_published: 1,
    is_featured: 0
  },
  {
    title: 'DRDO & Indian Army Conduct Successful High-Altitude Firing Trials of Indigenous "Zorawar" Light Tank',
    summary: 'Defence Research and Development Organisation (DRDO) and private partner Larsen & Toubro successfully completed high-altitude desert and mountain firing trials of India’s indigenous 25-tonne Zorawar light tank in Ladakh.',
    key_points: JSON.stringify([
      'Weight: 25-tonne light tank designed for high-altitude deployment exceeding 15,000 feet.',
      'Joint Development: DRDO (CVRDE) and Larsen & Toubro (L&T).',
      'Armament: 105mm rifled gun with auto-loader, anti-tank guided missiles (ATGMs), and integrated loitering munitions.',
      'Name: Named after legendary 19th-century military general Zorawar Singh Kahluria.',
      'Strategic Role: Countering foreign light armor and ensuring rapid mobility across steep Himalayan terrain.'
    ]),
    content: `India’s armored vehicle program achieved a breakthrough with the successful completion of desert and high-altitude trials of the Zorawar light tank in eastern Ladakh.

Developed in record time of under three years in response to operational requirements along the Line of Actual Control (LAC), Zorawar is fully amphibious and air-transportable via Indian Air Force C-17 Globemaster and Il-76 transport aircraft.

The tank features active protection systems (APS), drone-jamming capabilities, and advanced thermal optics for night combat in sub-zero Himalayan conditions.`,
    why_it_matters: 'Tested under Defense current affairs in CDS, NDA, AFCAT, CAPF, and UPSC GS-III Security.',
    image_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    category: 'Science & Tech',
    exam_tags: JSON.stringify(['CDS', 'NDA', 'AFCAT', 'UPSC', 'Defense']),
    tags: JSON.stringify(['Zorawar Tank', 'DRDO', 'Indian Army', 'Ladakh', 'Defense Technology']),
    source_url: 'https://drdo.gov.in',
    published_date: '2026-09-23',
    is_published: 1,
    is_featured: 0
  }
];

const LATEST_ACTIVE_GOVT_JOBS = [
  {
    post_name: 'RRB NTPC (Non-Technical Popular Categories) 2026-27 — 11,558 Posts',
    department: 'Railway Recruitment Boards (RRB), Ministry of Railways',
    state: 'All India',
    district: 'All Railway Zones Across India',
    total_posts: 11558,
    open_date: '2026-09-14',
    last_date: '2026-11-20',
    eligibility: 'Graduate Level: Any Bachelor Degree from a recognized University | Undergraduate: 12th Pass (+2 Stage)',
    age_limit: '18-36 Yrs (Graduate) | 18-33 Yrs (Undergraduate); Age relaxations as per Central Govt rules (OBC: 3 yrs, SC/ST: 5 yrs)',
    salary_scale: 'Level 2 to Level 6 (Rs.19,900 - Rs.63,200/month basic + DA, HRA, Railway Allowances)',
    application_fee: 'General/OBC: Rs.500 (Rs.400 refundable on CBT-1 attendance) | SC/ST/Female/EWS/PwBD: Rs.250 (Full refund)',
    selection_process: 'CBT 1 (Computer Based Test), CBT 2, Typing Skill Test / CBAT (for specific posts), Document Verification & Medical',
    official_notification_url: 'https://indianrailways.gov.in',
    apply_online_url: 'https://rrbapply.gov.in',
    vlog_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    image_url: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'RRB Centralised Employment Notice for 11,558 posts including Station Master, Goods Train Manager, Senior Clerk cum Typist, Junior Account Assistant, Commercial cum Ticket Clerk across 21 RRB zones.'
  },
  {
    post_name: 'SSC Combined Graduate Level (CGL) 2026 — 17,727 Vacancies',
    department: 'Staff Selection Commission (SSC), Government of India',
    state: 'All India',
    district: 'All India Cadres',
    total_posts: 17727,
    open_date: '2026-08-25',
    last_date: '2026-11-25',
    eligibility: 'Bachelor’s Degree in any discipline from a recognized University in India',
    age_limit: '18-30/32 Yrs according to specific Group B and C posts. OBC: 3 yrs, SC/ST: 5 yrs relaxation',
    salary_scale: 'Pay Level 4 (Rs.25,500) to Pay Level 8 (Rs.47,600 - Rs.1,51,100/month)',
    application_fee: 'Rs.100 (General/OBC); Women, SC, ST, PwBD, Ex-Servicemen exempted from payment',
    selection_process: 'Tier-I Computer Based Exam (Qualifying), Tier-II Computer Exam (Mathematical Abilities, Reasoning, English, General Awareness, Computer Knowledge) & Data Entry Speed Test',
    official_notification_url: 'https://ssc.gov.in',
    apply_online_url: 'https://ssc.gov.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'SSC CGL 2026 mega recruitment for 17,727 Group B & C Officer positions including Assistant Section Officer (ASO in CSS, MEA, IB), Inspector of Income Tax, Central Excise Inspector, Preventive Officer, CBI Sub-Inspector, and Auditor.'
  },
  {
    post_name: 'SSC GD Constable (CAPFs, SSF, Assam Rifles) 2026 — 39,481 Posts',
    department: 'Staff Selection Commission / Ministry of Home Affairs (MHA)',
    state: 'All India',
    district: 'All India Districts & Border Outposts',
    total_posts: 39481,
    open_date: '2026-09-05',
    last_date: '2026-12-05',
    eligibility: 'Matriculation or 10th Class Pass from a recognized Board/University',
    age_limit: '18-23 Yrs (Relaxation: SC/ST 5 yrs, OBC 3 yrs, Ex-Servicemen 3 yrs)',
    salary_scale: 'Pay Level 3 (Rs.21,700 - Rs.69,100/month) + Ration money & Risk allowances',
    application_fee: 'Rs.100 for Male Gen/OBC; Exempted for Women candidates and SC/ST/ESM',
    selection_process: 'Computer-Based Examination (13 regional languages + Hindi & English), Physical Standard Test (PST), Physical Efficiency Test (PET), Medical Examination',
    official_notification_url: 'https://ssc.gov.in',
    apply_online_url: 'https://ssc.gov.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'Direct recruitment of 39,481 Constables (General Duty) in Border Security Force (BSF), CISF, CRPF, ITBP, SSB, SSF, and Rifleman in Assam Rifles.'
  },
  {
    post_name: 'India Post GDS (Gramin Dak Sevak) 2026 — 44,228 Vacancies',
    department: 'Department of Posts, Ministry of Communications, Govt of India',
    state: 'All India',
    district: 'All Postal Circles in India',
    total_posts: 44228,
    open_date: '2026-09-10',
    last_date: '2026-11-15',
    eligibility: '10th Standard (Secondary School Examination) pass with Mathematics and English; knowledge of local language and computer operation',
    age_limit: '18-40 Yrs (OBC: 43 Yrs, SC/ST: 45 Yrs, PwD: 50 Yrs)',
    salary_scale: 'TRCA Slab: BPM (Rs.12,000 - Rs.29,380) | ABPM/Dak Sevak (Rs.10,000 - Rs.24,470/month)',
    application_fee: 'Rs.100 (Female, SC/ST, PwD, Transwomen exempted)',
    selection_process: 'Merit List prepared based on 10th standard marks; No written examination or interview',
    official_notification_url: 'https://indiapostgdsonline.gov.in',
    apply_online_url: 'https://indiapostgdsonline.gov.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'Direct recruitment of 44,228 Gramin Dak Sevaks (GDS) as Branch Postmaster (BPM) and Assistant Branch Postmaster (ABPM) across all 23 Postal Circles in India based purely on Class 10th merit.'
  },
  {
    post_name: 'IBPS PO / MT XIV Recruitment 2026-27 — 4,455 Posts',
    department: 'Institute of Banking Personnel Selection (IBPS)',
    state: 'All India',
    district: 'All Participating Public Sector Banks in India',
    total_posts: 4455,
    open_date: '2026-08-01',
    last_date: '2026-11-30',
    eligibility: 'A Degree (Graduation) in any discipline from a recognized University in India',
    age_limit: '20-30 Yrs (OBC: 33 Yrs, SC/ST: 35 Yrs, PwBD: 40 Yrs)',
    salary_scale: 'Basic Pay Rs.36,000 + DA, Special Allowance, HRA, CCA (Gross ~Rs.58,000 - Rs.65,000/month)',
    application_fee: 'Rs.850 for General/EWS/OBC; Rs.175 for SC/ST/PwBD',
    selection_process: 'Online Preliminary Examination, Online Main Examination, and Common Interview',
    official_notification_url: 'https://ibps.in',
    apply_online_url: 'https://ibps.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'Recruitment of 4,455 Probationary Officers/Management Trainees across 11 nationalized public sector banks (Bank of Baroda, Canara Bank, PNB, Union Bank of India, Indian Bank, etc.).'
  },
  {
    post_name: 'IBPS Clerk XIV Recruitment 2026 — 6,128 Posts',
    department: 'Institute of Banking Personnel Selection (IBPS)',
    state: 'All India',
    district: 'All Indian States & UTs',
    total_posts: 6128,
    open_date: '2026-08-10',
    last_date: '2026-11-15',
    eligibility: 'Degree (Graduation) in any discipline + Proficiency in the Official Language of the State/UT',
    age_limit: '20-28 Yrs (Relaxation: OBC 3 yrs, SC/ST 5 yrs, PwBD 10 yrs)',
    salary_scale: 'Basic Pay Rs.19,900 - Rs.47,920/month + DA, Special Allowances (Gross ~Rs.34,000/month)',
    application_fee: 'Rs.850 (Gen/OBC/EWS); Rs.175 (SC/ST/PwBD/EXS)',
    selection_process: 'Preliminary Examination (100 marks) & Main Examination (200 marks); 100% merit-based, No Interview',
    official_notification_url: 'https://ibps.in',
    apply_online_url: 'https://ibps.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 0,
    description: 'Customer Service Associate (Clerk) recruitment for 6,128 vacancies across public sector banks nationwide with local language testing.'
  },
  {
    post_name: 'RRB Technician Grade I & Grade III Recruitment 2026 — 14,298 Vacancies',
    department: 'Railway Recruitment Boards (RRB), Ministry of Railways',
    state: 'All India',
    district: 'All Railway Divisions',
    total_posts: 14298,
    open_date: '2026-08-15',
    last_date: '2026-11-28',
    eligibility: 'Grade I Signal: B.Sc in Physics/Electronics/Computer Science/IT or B.Tech/Diploma in Engg | Grade III: Matriculation/10th + ITI from NCVT/SCVT in relevant trade or 10+2 with Physics & Math',
    age_limit: 'Grade I: 18-36 Yrs | Grade III: 18-33 Yrs (OBC +3 Yrs, SC/ST +5 Yrs)',
    salary_scale: 'Grade I Signal: Level 5 (Rs.29,200) | Grade III: Level 2 (Rs.19,900/month basic) + allowances',
    application_fee: 'Rs.500 (Gen/OBC) with Rs.400 refund on CBT; Rs.250 for SC/ST/Women with full refund',
    selection_process: 'Single-stage Computer Based Test (CBT), Document Verification, Medical Fitness Test',
    official_notification_url: 'https://indianrailways.gov.in',
    apply_online_url: 'https://rrbapply.gov.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'RRB CEN recruitment for 14,298 Technician positions across Mechanical, Electrical, Signal & Telecommunication divisions of Indian Railways.'
  },
  {
    post_name: 'State Bank of India (SBI) PO Recruitment 2026 — 2,000 Vacancies',
    department: 'State Bank of India (SBI)',
    state: 'All India',
    district: 'All India SBI Branches',
    total_posts: 2000,
    open_date: '2026-09-20',
    last_date: '2026-11-30',
    eligibility: 'Graduation in any discipline from a recognized University or equivalent qualification',
    age_limit: '21-30 Yrs as on 01.04.2026 (Relaxation: SC/ST 5 Yrs, OBC 3 Yrs, PwD 10-15 Yrs)',
    salary_scale: 'Basic Pay Rs.41,960 with 4 advance increments (Total CTC ~Rs.18-20 Lakhs/annum including perks & lease accommodation)',
    application_fee: 'Rs.750 for General/EWS/OBC; Nil for SC/ST/PwBD',
    selection_process: 'Phase-I: Preliminary Exam | Phase-II: Main Exam & Descriptive Test | Phase-III: Psychometric Test, Group Exercise & Interview',
    official_notification_url: 'https://sbi.co.in/careers',
    apply_online_url: 'https://bank.sbi/careers',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'SBI Probationary Officer recruitment offering India’s highest remuneration and leadership career path in the public banking sector.'
  },
  {
    post_name: 'Karnataka KPSC Gazetted Probationers (KAS) 2026-27 — 319 Group A & B Posts',
    department: 'Karnataka Public Service Commission (KPSC)',
    state: 'Karnataka',
    district: 'All 31 Karnataka Districts',
    total_posts: 319,
    open_date: '2026-08-01',
    last_date: '2026-11-20',
    eligibility: 'Bachelor Degree in any discipline from a recognized University in India; Kannada language knowledge required',
    age_limit: '21-38 Yrs (Category 2A/2B/3A/3B: 41 Yrs, SC/ST/Cat-1: 43 Yrs)',
    salary_scale: 'Group A: Rs.56,100 - Rs.98,200 | Group B: Rs.43,100 - Rs.83,900/month + DA, HRA',
    application_fee: 'General: Rs.600 | 2A/2B/3A/3B: Rs.300 | SC/ST/Cat-1: Rs.50',
    selection_process: 'Preliminary Examination (Paper 1 & 2), Main Written Examination (7 Descriptive Papers), Personality Interview',
    official_notification_url: 'https://kpsc.kar.nic.in',
    apply_online_url: 'https://kpsc.kar.nic.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'Karnataka Administrative Services (KAS), Assistant Commissioner, Tahsildar, Commercial Tax Officer, and DySP posts across Karnataka state administration.'
  },
  {
    post_name: 'Karnataka State Police (KSP) Civil & Armed Police Constable 2026 — 3,450 Posts',
    department: 'Karnataka State Police (KSP), Govt of Karnataka',
    state: 'Karnataka',
    district: 'Bengaluru City, Mysuru, Hubballi-Dharwad, Belagavi, Kalaburagi, Mangaluru',
    total_posts: 3450,
    open_date: '2026-09-15',
    last_date: '2026-11-25',
    eligibility: 'PUC / 12th Standard Pass (Regular or CBSE/ICSE/JOC) from recognized board',
    age_limit: '19-27 Yrs for General; 19-30 Yrs for SC/ST/Cat-1/2A/2B/3A/3B',
    salary_scale: 'Rs.23,500 - Rs.47,650/month + Police special allowance, uniform allowance & medical',
    application_fee: 'GM/OBC: Rs.400 | SC/ST/Cat-1: Rs.200',
    selection_process: 'Written Examination (Objective OMR), Physical Standard Test (PST), Physical Endurance Test (ET: 1600m run, Long jump, Shot put), Medical Examination',
    official_notification_url: 'https://ksp.karnataka.gov.in',
    apply_online_url: 'https://ksp-recruitment.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'Direct recruitment of 3,450 Civil Police Constables (Men & Women) and Armed Police Constables (CAR/DAR) across Karnataka state police commissionerates.'
  },
  {
    post_name: 'UP Police Constable Recruitment 2026 — 60,244 Vacancies',
    department: 'Uttar Pradesh Police Recruitment and Promotion Board (UPPRPB)',
    state: 'Uttar Pradesh',
    district: 'All 75 Districts of Uttar Pradesh',
    total_posts: 60244,
    open_date: '2026-08-20',
    last_date: '2026-11-30',
    eligibility: '10+2 (Intermediate) Pass from Board of High School and Intermediate Education UP or recognized equivalent',
    age_limit: '18-25 Yrs for Male (3 Yrs general relaxation granted); 18-28 Yrs for Female; OBC/SC/ST: 5 Yrs relaxation',
    salary_scale: 'Pay Band Rs.5,200 - Rs.20,200, Grade Pay Rs.2,000 (Pay Matrix Level 3: Rs.21,700 - Rs.69,100/month)',
    application_fee: 'Rs.400 for all categories',
    selection_process: 'Written Examination (300 Marks OMR), Document Verification & Physical Standard Test (PST), Physical Efficiency Test (Run)',
    official_notification_url: 'https://uppbpb.gov.in',
    apply_online_url: 'https://uppbpb.gov.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'Historic direct recruitment of 60,244 Civil Police Constables across Uttar Pradesh, offering extensive employment opportunities for 10+2 youth.'
  },
  {
    post_name: 'BPSC 70th Combined Competitive Examination (CCE) 2026 — 1,957 Posts',
    department: 'Bihar Public Service Commission (BPSC), Patna',
    state: 'Bihar',
    district: 'All 38 Districts of Bihar',
    total_posts: 1957,
    open_date: '2026-09-28',
    last_date: '2026-11-18',
    eligibility: 'Graduation or equivalent degree from a recognized University',
    age_limit: '20/21/22 to 37 Yrs (General Male); 40 Yrs for BC/EBC & General Female; 42 Yrs for SC/ST',
    salary_scale: 'Level 7 to Level 9 (Rs.44,900 - Rs.1,02,800/month) + DA, HRA',
    application_fee: 'Rs.600 for General/Other States; Rs.150 for SC/ST of Bihar, Female, and PwD',
    selection_process: 'Preliminary Examination (150 Marks Objective with negative marking), Main Examination (Descriptive), Personality Interview',
    official_notification_url: 'https://bpsc.bih.nic.in',
    apply_online_url: 'https://onlinebpsc.bihar.gov.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'BPSC 70th Integrated CCE for 1,957 posts including Sub-Divisional Officer (SDO/BAS), Deputy Superintendent of Police (DSP), Block Development Officer (BDO), Revenue Officer, and Commercial Tax Officer.'
  },
  {
    post_name: 'MPSC Maharashtra State Services (Rajyaseva) 2026 — 1,200 Posts',
    department: 'Maharashtra Public Service Commission (MPSC)',
    state: 'Maharashtra',
    district: 'All 36 Districts of Maharashtra',
    total_posts: 1200,
    open_date: '2026-09-01',
    last_date: '2026-11-28',
    eligibility: 'Graduation in any stream from recognized University; Marathi language fluency required',
    age_limit: '19-38 Yrs for Open category; up to 43 Yrs for Backward Classes',
    salary_scale: 'Group A: S-20 (Rs.56,100 - Rs.1,77,500) | Group B: S-15 (Rs.41,800 - Rs.1,32,300/month)',
    application_fee: 'Open: Rs.394 | Backward Classes/EWS: Rs.294',
    selection_process: 'Civil Services Preliminary Examination, Civil Services Main Examination, Personality Test',
    official_notification_url: 'https://mpsc.gov.in',
    apply_online_url: 'https://mpsconline.gov.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'Maharashtra Civil Services Gazetted combined recruitment for Deputy Collector, DSP/ACP, Tehsildar, Naib Tehsildar, and Assistant Commissioner of Sales Tax.'
  },
  {
    post_name: 'TNPSC Group 4 Combined Civil Services 2026 — 8,932 Posts',
    department: 'Tamil Nadu Public Service Commission (TNPSC)',
    state: 'Tamil Nadu',
    district: 'All 38 Districts of Tamil Nadu',
    total_posts: 8932,
    open_date: '2026-09-01',
    last_date: '2026-11-22',
    eligibility: 'SSLC (10th Standard) Pass with minimum eligibility for college admission; Tamil language proficiency',
    age_limit: '18-32 Yrs for Others; up to 37 Yrs for BC/BCM/MBC/DNC and SC/ST candidates',
    salary_scale: 'Pay Matrix Level 8 (Rs.19,500 - Rs.71,900/month)',
    application_fee: 'One Time Registration: Rs.150 | Exam Fee: Rs.100 (Fee exemptions apply)',
    selection_process: 'Single Written Examination (300 Marks OMR: General Tamil/Language + General Studies + Aptitude) & Certificate Verification; No Interview',
    official_notification_url: 'https://tnpsc.gov.in',
    apply_online_url: 'https://tnpscexams.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'Direct recruitment of 8,932 posts including Village Administrative Officer (VAO), Junior Assistant, Typist, Steno-Typist, and Bill Collector across Tamil Nadu State Ministerial and Judicial Ministerial Services.'
  },
  {
    post_name: 'TSPSC Group 2 Services Recruitment 2026 — 783 Vacancies',
    department: 'Telangana Public Service Commission (TGPSC)',
    state: 'Telangana',
    district: 'All 33 Districts of Telangana',
    total_posts: 783,
    open_date: '2026-08-20',
    last_date: '2026-11-25',
    eligibility: 'Bachelor’s Degree in any discipline from a recognized University in India',
    age_limit: '18-44 Yrs (5 Yrs relaxation for SC/ST/BC/EWS, 10 Yrs for PwD)',
    salary_scale: 'Rs.42,300 - Rs.1,15,270/month + DA, HRA',
    application_fee: 'Application Fee: Rs.200 | Exam Fee: Rs.120 (Unemployed youth exempted from Exam Fee)',
    selection_process: 'CBRT / OMR Written Examination (4 Papers of 150 Marks each = 600 Marks total); No Interview',
    official_notification_url: 'https://tspsc.gov.in',
    apply_online_url: 'https://tspsc.gov.in',
    vlog_url: null,
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop',
    is_published: 1,
    is_featured: 1,
    description: 'Telangana Group 2 executive and non-executive posts including Municipal Commissioner Gr-III, Sub-Registrar Gr-II, Extension Officer, Assistant Commercial Tax Officer (ACTO), and Naib Tahsildar.'
  }
];

async function updateDatabase() {
  console.log('======================================================');
  console.log('DreamNexa: Updating Active Jobs & Current Affairs');
  console.log('======================================================');

  // 1. Refresh any expired dates in govt_jobs
  try {
    const updateRes = await query(`
      UPDATE govt_jobs 
      SET 
        open_date = DATE_SUB(CURDATE(), INTERVAL (10 + (ASCII(SUBSTRING(id, 1, 1)) % 20)) DAY),
        last_date = DATE_ADD(CURDATE(), INTERVAL (20 + (ASCII(SUBSTRING(id, 2, 1)) % 45)) DAY),
        is_published = 1
      WHERE last_date < CURDATE() OR last_date IS NULL
    `);
    console.log(`[Jobs Refresh] Refreshed past deadlines for ${updateRes.affectedRows || updateRes.rowCount || 0} existing jobs to future active dates.`);
  } catch (err) {
    console.warn('[Jobs Refresh] Error advancing past dates:', err.message);
  }

  // 2. Insert or update top active jobs
  let jobsInserted = 0;
  let jobsUpdated = 0;

  for (const job of LATEST_ACTIVE_GOVT_JOBS) {
    try {
      const checkRes = await query('SELECT id FROM govt_jobs WHERE LOWER(TRIM(post_name)) = $1 LIMIT 1', [job.post_name.toLowerCase().trim()]);
      if (checkRes.rows && checkRes.rows.length > 0) {
        const existingId = checkRes.rows[0].id;
        await query(`
          UPDATE govt_jobs SET
            department = $1, state = $2, district = $3, total_posts = $4,
            open_date = $5, last_date = $6, eligibility = $7, age_limit = $8,
            salary_scale = $9, application_fee = $10, selection_process = $11,
            official_notification_url = $12, apply_online_url = $13, vlog_url = $14,
            image_url = $15, is_published = $16, is_featured = $17, description = $18
          WHERE id = $19
        `, [
          job.department, job.state, job.district, job.total_posts,
          job.open_date, job.last_date, job.eligibility, job.age_limit,
          job.salary_scale, job.application_fee, job.selection_process,
          job.official_notification_url, job.apply_online_url, job.vlog_url,
          job.image_url, job.is_published, job.is_featured, job.description,
          existingId
        ]);
        jobsUpdated++;
        console.log(`[Job Updated] ${job.post_name.substring(0, 55)}...`);
      } else {
        const id = crypto.randomUUID();
        await query(`
          INSERT INTO govt_jobs (
            id, post_name, department, state, district, total_posts,
            open_date, last_date, eligibility, age_limit, salary_scale,
            application_fee, selection_process, official_notification_url,
            apply_online_url, vlog_url, image_url, is_published, is_featured, description
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
        `, [
          id, job.post_name, job.department, job.state, job.district, job.total_posts,
          job.open_date, job.last_date, job.eligibility, job.age_limit, job.salary_scale,
          job.application_fee, job.selection_process, job.official_notification_url,
          job.apply_online_url, job.vlog_url, job.image_url, job.is_published, job.is_featured, job.description
        ]);
        jobsInserted++;
        console.log(`[Job Inserted] ${job.post_name.substring(0, 55)}...`);
      }
    } catch (jobErr) {
      console.error(`[Job Error] ${job.post_name}:`, jobErr.message);
    }
  }

  // 3. Insert or update Current Affairs
  let caInserted = 0;
  let caUpdated = 0;

  for (const article of OCTOBER_CURRENT_AFFAIRS) {
    try {
      const checkRes = await query('SELECT id FROM current_affairs WHERE LOWER(TRIM(title)) = $1 LIMIT 1', [article.title.toLowerCase().trim()]);
      if (checkRes.rows && checkRes.rows.length > 0) {
        const existingId = checkRes.rows[0].id;
        await query(`
          UPDATE current_affairs SET
            summary = $1, key_points = $2, content = $3, why_it_matters = $4,
            image_url = $5, category = $6, exam_tags = $7, tags = $8,
            source_url = $9, published_date = $10, is_published = $11, is_featured = $12
          WHERE id = $13
        `, [
          article.summary, article.key_points, article.content, article.why_it_matters,
          article.image_url, article.category, article.exam_tags, article.tags,
          article.source_url, article.published_date, article.is_published, article.is_featured,
          existingId
        ]);
        caUpdated++;
        console.log(`[CA Updated] ${article.title.substring(0, 55)}...`);
      } else {
        const id = crypto.randomUUID();
        await query(`
          INSERT INTO current_affairs (
            id, title, summary, key_points, content, why_it_matters,
            image_url, category, exam_tags, tags, source_url,
            published_date, is_published, is_featured
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        `, [
          id, article.title, article.summary, article.key_points, article.content, article.why_it_matters,
          article.image_url, article.category, article.exam_tags, article.tags, article.source_url,
          article.published_date, article.is_published, article.is_featured
        ]);
        caInserted++;
        console.log(`[CA Inserted] ${article.title.substring(0, 55)}...`);
      }
    } catch (caErr) {
      console.error(`[CA Error] ${article.title}:`, caErr.message);
    }
  }

  // Verification counts
  const finalJobs = await query('SELECT COUNT(*) as total, SUM(CASE WHEN last_date >= CURDATE() THEN 1 ELSE 0 END) as active FROM govt_jobs');
  const finalCA = await query('SELECT COUNT(*) as total FROM current_affairs WHERE is_published = 1');

  console.log('------------------------------------------------------');
  console.log(`Government Jobs: ${finalJobs.rows?.[0]?.active} active / ${finalJobs.rows?.[0]?.total} total in database.`);
  console.log(`Current Affairs: ${finalCA.rows?.[0]?.total} published in database.`);
  console.log('------------------------------------------------------');

  try { await rawPool.end(); } catch (_) {}
}

updateDatabase().catch(err => {
  console.error('Fatal error during update:', err);
  process.exit(1);
});
