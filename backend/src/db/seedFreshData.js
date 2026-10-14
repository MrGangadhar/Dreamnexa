/**
 * seedFreshData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds current active govt jobs + fresh current affairs (Oct 2024 – active).
 * Idempotent — uses INSERT IGNORE so safe to re-run.
 *
 * Run: node src/db/seedFreshData.js
 */
'use strict';

require('dotenv').config();
const { query, rawPool } = require('./pool');

// ─── TODAY ───────────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];

// ─── CURRENT AFFAIRS (Oct 2024 — real India events) ──────────────────────────
const CURRENT_AFFAIRS = [
  {
    title: 'Nobel Peace Prize 2024: Nihon Hidankyo — Japanese Atomic Bomb Survivors Organisation',
    summary: 'The Nobel Committee awarded the 2024 Peace Prize to Nihon Hidankyo, the Japanese organisation of atomic bomb survivors (Hibakusha), for efforts to achieve a world free of nuclear weapons.',
    key_points: JSON.stringify([
      'Nihon Hidankyo (Japan Confederation of A- and H-Bomb Sufferers Organisations) won Nobel Peace Prize 2024.',
      'Founded in 1956 by Hiroshima and Nagasaki atomic bomb survivors (Hibakusha).',
      'Recognised for decades of testimony-based advocacy for nuclear disarmament.',
      'The prize comes amid rising nuclear tensions globally — Russia-Ukraine conflict, N. Korea developments.',
      'Nobel Peace Prize announcement: October 11, 2024, Oslo.'
    ]),
    content: `The Norwegian Nobel Committee awarded the 2024 Nobel Peace Prize to Nihon Hidankyo, the Japanese grassroots movement of Hibakusha (atomic bomb survivors), on October 11, 2024.

Founded in 1956, Nihon Hidankyo has for nearly seven decades sent living witnesses of the Hiroshima and Nagasaki bombings to testify before governments, the UN, and international bodies about the humanitarian catastrophe of nuclear weapons. The Committee noted that the prize is awarded at a time when the taboo against nuclear weapons is under pressure and the number of nuclear warheads is increasing globally.`,
    why_it_matters: 'Nobel Prize winners are a mandatory topic for SSC CGL, IBPS PO, Railway NTPC, and UPSC Prelims GA sections. Nuclear policy links to GS-II (IR) and GS-III.',
    image_url: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=800&q=80',
    category: 'International',
    exam_tags: JSON.stringify(['UPSC', 'SSC', 'Banking', 'Railway', 'State PSC']),
    tags: JSON.stringify(['Nobel Prize 2024', 'Nihon Hidankyo', 'Hibakusha', 'Nuclear Disarmament', 'Japan']),
    source_url: 'https://www.nobelprize.org',
    published_date: '2024-10-11',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'Nobel Prize in Economics 2024: Acemoglu, Johnson & Robinson — Institutions & Prosperity',
    summary: 'Daron Acemoglu, Simon Johnson, and James A. Robinson won the 2024 Nobel Economics Prize for studies on how institutions are formed and affect prosperity — with colonial history evidence.',
    key_points: JSON.stringify([
      'Daron Acemoglu (MIT), Simon Johnson (MIT), James A. Robinson (U. of Chicago) share the prize.',
      'Work: Countries with good institutions (rule of law, property rights) prosper; extractive institutions cause poverty.',
      'Key book: "Why Nations Fail" (2012) by Acemoglu & Robinson.',
      'Evidence from European colonial history — inclusive vs extractive institutions.',
      'Announcement: October 14, 2024.'
    ]),
    content: `The Royal Swedish Academy of Sciences awarded the 2024 Sveriges Riksbank Prize in Economic Sciences (Nobel Economics) to Daron Acemoglu, Simon Johnson, and James A. Robinson on October 14, 2024.

Their work demonstrates that societies with poor rule of law and institutions that exploit the population will not generate growth or change for the better. Using the diverse institutional patterns created by European colonialism as a natural experiment, they showed that colonies where extractive institutions were set up remain poorer today. Their work explains a large portion of global income inequality through institutional differences rather than geography or culture alone.`,
    why_it_matters: 'Economics Nobel relevant to UPSC GS-III, Economy optional. Also tested in Banking Awareness (RBI Grade B), SSC GA sections.',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    category: 'Economy',
    exam_tags: JSON.stringify(['UPSC', 'Banking', 'SSC', 'State PSC']),
    tags: JSON.stringify(['Nobel Prize Economics 2024', 'Acemoglu', 'Why Nations Fail', 'Institutions']),
    source_url: 'https://www.nobelprize.org',
    published_date: '2024-10-14',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'India\'s Space Docking Experiment (SpaDeX) Mission — ISRO Prepares for Dec 2024 Launch',
    summary: 'ISRO\'s SpaDeX mission will demonstrate space docking technology, making India only the 4th nation after USA, Russia, China to master orbital docking — critical for future lunar missions.',
    key_points: JSON.stringify([
      'SpaDeX = Space Docking Experiment — ISRO\'s demonstration of rendezvous and docking in orbit.',
      'Two small spacecraft (Chaser + Target, ~220 kg each) launched on PSLV-C60.',
      'Launch: Targeted December 2024, Sriharikota.',
      'India will become only 4th country to demonstrate space docking (after USA, Russia, China).',
      'Critical for Chandrayaan-4 lunar sample return mission and Bharatiya Antariksha Station (BAS).'
    ]),
    content: `ISRO\'s Space Docking Experiment (SpaDeX) is an ambitious technology demonstrator mission scheduled for launch in late 2024 on PSLV-C60 from Sriharikota.

SpaDeX consists of two small spacecraft — a Chaser and a Target — that will autonomously perform proximity operations, rendezvous, and docking in low Earth orbit. Successful docking will make India the fourth country in the world to achieve this capability, following the USA (1966), USSR/Russia (1967), and China (2011).

This capability is mandatory for ISRO\'s future Chandrayaan-4 (lunar sample return), crew transfer to the Bharatiya Antariksha Station (BAS, India\'s planned space station), and deep-space exploration missions.`,
    why_it_matters: 'ISRO missions are extremely important for UPSC Prelims (GS-III Science/Technology), SSC CGL, Railway NTPC, and Banking GK. Space docking is a frequently asked concept.',
    image_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    category: 'Science & Tech',
    exam_tags: JSON.stringify(['UPSC', 'SSC', 'Banking', 'Railway', 'GATE']),
    tags: JSON.stringify(['ISRO', 'SpaDeX', 'Space Docking', 'PSLV', 'Chandrayaan', 'Space Technology']),
    source_url: 'https://www.isro.gov.in',
    published_date: '2024-10-10',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'PM Modi\'s State Visit to Russia & Austria: Key Outcomes & Bilateral Agreements',
    summary: 'PM Modi visited Russia (July 2024) & Austria (July 2024) — India\'s first bilateral Russia visit in 5 years. Met Putin, discussed Ukraine conflict, trade, defence, energy.',
    key_points: JSON.stringify([
      'PM Modi visited Moscow, Russia on July 8-9, 2024 — first India-Russia bilateral summit since 2019.',
      'Met President Vladimir Putin at his Novo-Ogaryovo residence.',
      'India reaffirmed commitment to dialogue for peaceful resolution of Ukraine conflict.',
      'Key outcomes: Civil nuclear cooperation, oil & gas trade, Arctic shipping route discussions.',
      'Then visited Vienna, Austria (July 9-10, 2024) — first PM\'s visit to Austria in 41 years.'
    ]),
    content: `Prime Minister Narendra Modi\'s back-to-back state visits to Russia and Austria in July 2024 were significant diplomatic milestones.

In Moscow, PM Modi held a bilateral summit with President Putin — the first such meeting since 2019 — at Novo-Ogaryovo residence. Modi emphasized India\'s commitment to peace and dialogue on the Ukraine conflict, while the two leaders discussed expanding bilateral trade, civilian nuclear cooperation, and oil & gas supplies (India imports significant Russian crude). The visit was criticised by the West given the timing coincided with a Russian missile strike on a Ukrainian children\'s hospital.

The Austria visit — the first by an Indian PM in 41 years — focused on economic ties, technology cooperation, and EU-India relations.`,
    why_it_matters: 'India\'s foreign policy events are a key topic for UPSC GS-II (International Relations), State PSC Mains, and Banking GK sections.',
    image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80',
    category: 'International',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'Banking', 'SSC']),
    tags: JSON.stringify(['PM Modi', 'Russia Visit', 'Putin', 'India Foreign Policy', 'Ukraine', 'Austria']),
    source_url: 'https://mea.gov.in',
    published_date: '2024-07-09',
    is_published: 1,
    is_featured: 0
  },
  {
    title: '18th Lok Sabha Constituted: NDA Returns; Speaker Om Birla Re-elected',
    summary: 'India\'s 18th Lok Sabha constituted after 2024 General Elections. NDA won 293 seats; BJP 240. Om Birla re-elected Speaker. Congress won 99 seats — best since 2009.',
    key_points: JSON.stringify([
      '18th Lok Sabha constituted in June 2024 after General Elections (Apr 19 – Jun 1, 2024).',
      'Total seats: 543; Majority mark: 272.',
      'NDA tally: 293 (BJP: 240, TDP: 16, JD(U): 12, others).',
      'INDIA Alliance: ~232 seats; Congress: 99 seats (best since 2009).',
      'Om Birla (BJP, Kota-Bundi) re-elected as Lok Sabha Speaker.',
      'PM Narendra Modi sworn in for 3rd consecutive term on June 9, 2024.'
    ]),
    content: `India\'s 18th General Elections were conducted in 7 phases from April 19 to June 1, 2024, with results declared on June 4.

The BJP-led NDA secured 293 seats — sufficient for a majority — with BJP alone winning 240 seats, down from 303 in 2019. The opposition INDIA Alliance performed better than predicted, winning around 232 seats, led by the Congress party\'s strong showing of 99 seats.

PM Narendra Modi was sworn in for a historic third consecutive term on June 9, 2024, leading a coalition government with TDP and JD(U) as key allies.

Om Birla of BJP was re-elected as the Speaker of the Lok Sabha on June 26, 2024.`,
    why_it_matters: 'Essential for UPSC (Polity & Governance GS-II), State PSC, Banking GA, SSC CGL, Railway NTPC. Lok Sabha composition, Speaker elections are standard exam questions.',
    image_url: 'https://images.unsplash.com/photo-1567596388756-f6d710c8fc07?auto=format&fit=crop&w=800&q=80',
    category: 'Politics',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'SSC', 'Banking', 'Railway']),
    tags: JSON.stringify(['18th Lok Sabha', 'General Elections 2024', 'NDA', 'Modi', 'Om Birla', 'Polity']),
    source_url: 'https://eci.gov.in',
    published_date: '2024-06-04',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'Paris Olympics 2024: India Wins 6 Medals — Neeraj Chopra Silver, Manu Bhaker 2 Bronze',
    summary: 'India won 6 medals at Paris Olympics 2024 (Jul 26 – Aug 11). Manu Bhaker won 2 bronze medals (shooting). Neeraj Chopra won silver in javelin. First Indian woman to win 2 medals in single Olympics.',
    key_points: JSON.stringify([
      'Paris Olympics 2024: July 26 – August 11, 2024. India\'s overall rank: 71st.',
      'India\'s 6 medals: 0 Gold, 1 Silver, 5 Bronze.',
      'Silver: Neeraj Chopra — Men\'s Javelin Throw (85.97m). Won Gold at Tokyo 2020.',
      'Bronze: Manu Bhaker — 10m Air Pistol & 10m Air Pistol Mixed Team (with Sarabjot Singh).',
      'Bronze: Swapnil Kusale — 50m Rifle 3 Positions. Bronze: Hockey — Men\'s Team India.',
      'Bronze: Aman Sehrawat — Wrestling (Men\'s Freestyle 57kg). Youngest Indian Olympic medallist.',
      'Manu Bhaker: First Indian woman to win 2 medals in a single Olympics.'
    ]),
    content: `India\'s contingent at the Paris Olympics 2024 (July 26 – August 11) brought home 6 medals — the same count as Tokyo 2020 but with a different composition.

Star shooter Manu Bhaker became India\'s hero of the Games, winning bronze in the 10m Air Pistol (Women\'s) and bronze in the 10m Air Pistol Mixed Team event alongside Sarabjot Singh. She became the first Indian woman to win two medals in a single Olympic Games edition.

Neeraj Chopra, the defending javelin champion, threw 85.97m to claim a silver medal — his throw narrowly beaten by Pakistan\'s Arshad Nadeem\'s 92.97m world record throw. Swapnil Kusale won bronze in 50m Rifle 3 Positions. India\'s Men\'s Hockey team claimed bronze. Aman Sehrawat won wrestling bronze at 19, becoming India\'s youngest Olympic medallist.`,
    why_it_matters: 'Olympics medal winners, countries, and sports facts are among the most frequently tested in SSC CGL, IBPS, Railway NTPC GK, and State PSC GA sections.',
    image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    category: 'Sports',
    exam_tags: JSON.stringify(['SSC', 'Banking', 'Railway', 'UPSC', 'State PSC']),
    tags: JSON.stringify(['Paris Olympics 2024', 'Neeraj Chopra', 'Manu Bhaker', 'India Medals', 'Hockey', 'Wrestling']),
    source_url: 'https://olympics.com',
    published_date: '2024-08-11',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'RBI Holds Repo Rate at 6.5% — MPC October 2024 Policy Review',
    summary: 'The RBI Monetary Policy Committee kept the repo rate unchanged at 6.5% in its October 2024 meeting. GDP growth projected at 7.2% for FY25. CPI inflation at 5.1%.',
    key_points: JSON.stringify([
      'RBI MPC meeting: October 7-9, 2024. Repo rate: 6.5% (unchanged for 10th consecutive time).',
      'Standing Deposit Facility (SDF) rate: 6.25%. Marginal Standing Facility (MSF): 6.75%.',
      'GDP growth projection for FY2024-25: 7.2%.',
      'CPI inflation forecast for FY25: 4.5%. October 2024 CPI: ~5.1% (food inflation elevated).',
      'MPC vote: 5-1 to hold rates; 1 member voted for a 25bps cut.',
      'RBI Governor Shaktikanta Das chaired; tenure extended to December 2024.'
    ]),
    content: `The Reserve Bank of India\'s Monetary Policy Committee (MPC), chaired by Governor Shaktikanta Das, held its scheduled policy review on October 7-9, 2024.

The committee voted 5-1 to hold the repo rate unchanged at 6.5%, marking the 10th consecutive meeting without a rate change. The SDF rate remains at 6.25% and the MSF rate at 6.75%, keeping the policy corridor intact.

The RBI maintained its GDP growth projection of 7.2% for FY2024-25, noting that the Indian economy remains resilient despite global headwinds. CPI inflation projections were maintained at 4.5% for FY25, though food inflation — particularly vegetables — remained elevated above 5%.

Governor Das flagged that while headline inflation is trending towards the 4% target, the MPC needs confidence it will durably achieve the target before considering rate cuts.`,
    why_it_matters: 'RBI policy rates (repo, SDF, MSF, CRR, SLR) are mandatory for RBI Grade B, NABARD, IBPS PO/Clerk, SBI PO, and all Banking exams. Tested every exam cycle.',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    category: 'Economy',
    exam_tags: JSON.stringify(['Banking', 'UPSC', 'SSC', 'RBI Grade B', 'NABARD', 'State PSC']),
    tags: JSON.stringify(['RBI', 'Monetary Policy', 'Repo Rate', 'MPC', 'Inflation', 'GDP']),
    source_url: 'https://rbi.org.in',
    published_date: '2024-10-09',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'India\'s Union Budget 2024-25: Key Highlights — Capex ₹11.11 Lakh Cr, New Tax Slabs',
    summary: 'Finance Minister Nirmala Sitharaman presented Union Budget 2024-25 on July 23, 2024. Record capital expenditure of ₹11.11 lakh crore, revised income tax slabs under new regime.',
    key_points: JSON.stringify([
      'Budget 2024-25 presented July 23, 2024 by FM Nirmala Sitharaman (7th consecutive budget).',
      'Total expenditure: ₹48.21 lakh crore. Capital expenditure: ₹11.11 lakh crore (3.4% of GDP).',
      'Fiscal deficit target: 4.9% of GDP for FY25 (revised from 5.1%).',
      'New income tax regime: Revised slabs — ₹0-3L nil, ₹3-7L 5%, ₹7-10L 10%, ₹10-12L 15%, ₹12-15L 20%, above ₹15L 30%.',
      'Standard deduction raised from ₹50,000 to ₹75,000 under new regime.',
      'Angel tax abolished for all classes of investors.',
      'LTCG on equity raised from 10% to 12.5%; STCG from 15% to 20%.'
    ]),
    content: `Union Finance Minister Nirmala Sitharaman presented India\'s Union Budget 2024-25 on July 23, 2024 — her 7th consecutive budget presentation, a record.

Key allocations include: record capital expenditure of ₹11.11 lakh crore (3.4% of GDP) to boost infrastructure; total budget expenditure of ₹48.21 lakh crore; fiscal deficit revised down to 4.9% of GDP.

The budget introduced meaningful revisions to the New Tax Regime slabs, benefiting middle-class taxpayers. Standard deduction was increased from ₹50,000 to ₹75,000. Angel tax on startup investments was abolished. Capital gains taxes were revised: LTCG on listed equity raised to 12.5%, STCG to 20%.

Priority sectors: Employment & skilling (PM Internship Scheme for 1 crore youth), housing (3 crore rural homes under PMAY), infrastructure, and energy transition.`,
    why_it_matters: 'Union Budget is tested every year in Banking Awareness, UPSC Prelims (Economy), SSC CGL, Railway NTPC, and State PSC exams — among the most frequently asked GA topics.',
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    category: 'Economy',
    exam_tags: JSON.stringify(['UPSC', 'Banking', 'SSC', 'Railway', 'State PSC', 'CA']),
    tags: JSON.stringify(['Union Budget 2024', 'Nirmala Sitharaman', 'Capex', 'Income Tax', 'Fiscal Deficit']),
    source_url: 'https://indiabudget.gov.in',
    published_date: '2024-07-23',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'Chandrayaan-4 Mission Approved by Cabinet — India\'s Lunar Sample Return Mission',
    summary: 'India\'s Cabinet approved Chandrayaan-4 — a two-launch lunar sample return mission. ISRO will land near lunar south pole, collect samples, return to Earth. Budget: ₹2,104 crore.',
    key_points: JSON.stringify([
      'Union Cabinet approved Chandrayaan-4 in September 2024. Budget: ₹2,104.06 crore.',
      'Mission type: Lunar sample return — collect moon rocks and bring back to Earth.',
      'Two separate launches via LVM3 (formerly GSLV Mk-III) rocket.',
      'Target: Lunar South Pole region — same as Chandrayaan-3 landing site.',
      'If successful, India will be 4th country to return lunar samples (after USA, USSR, China).',
      'Part of broader Vikram Sarabhai Space Centre roadmap toward human Moon missions.'
    ]),
    content: `The Union Cabinet chaired by PM Narendra Modi approved the Chandrayaan-4 mission in September 2024 with a total budget of ₹2,104.06 crore.

Unlike Chandrayaan-3 (soft lander + rover), Chandrayaan-4 is a lunar sample return mission — it will land on the Moon, collect rock and soil samples from the lunar surface, and return them to Earth for scientific analysis. This requires two separate rocket launches and an unprecedented docking manoeuvre in lunar orbit — which is why ISRO\'s SpaDeX space docking experiment (planned Dec 2024) is a critical precursor.

India aims to be the 4th country to bring back lunar samples, after the United States (Apollo missions), the Soviet Union (Luna missions), and China (Chang\'e-5, 2020). The mission is part of ISRO\'s phased roadmap toward eventually landing Indian astronauts on the Moon.`,
    why_it_matters: 'ISRO space missions are a mandatory topic across all competitive exams. Chandrayaan-4, SpaDeX, and India\'s space roadmap are expected frequently in 2024-25 exams.',
    image_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    category: 'Science & Tech',
    exam_tags: JSON.stringify(['UPSC', 'SSC', 'Banking', 'Railway', 'ISRO']),
    tags: JSON.stringify(['Chandrayaan-4', 'ISRO', 'Moon Mission', 'Lunar Sample Return', 'Space']),
    source_url: 'https://www.isro.gov.in',
    published_date: '2024-09-18',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'Jammu & Kashmir Becomes UT with Legislature: Assembly Elections Held After 10 Years',
    summary: 'J&K Assembly Elections held Sept-Oct 2024 — first in 10 years since 2014, first as a Union Territory. National Conference-Congress alliance won majority. Omar Abdullah became CM.',
    key_points: JSON.stringify([
      'J&K Assembly elections: 3 phases — September 18, 25, October 1, 2024. Results: October 8.',
      'First elections after J&K was reorganized as UT in August 2019.',
      'National Conference (NC) + Congress alliance won 49 seats (majority mark: 46 in 90-seat assembly).',
      'National Conference alone won 42 seats; BJP won 29 seats.',
      'Omar Abdullah (NC) sworn in as Chief Minister on October 16, 2024.',
      'Lt. Governor: Sinha continues as administrator; Delhi-model governance (limited powers to CM).'
    ]),
    content: `Jammu & Kashmir held its Legislative Assembly elections across three phases on September 18, September 25, and October 1, 2024 — the first Assembly elections in the region in a decade (last held in 2014) and the first since J&K was reorganized from a full State into a Union Territory in August 2019.

The National Conference (NC) led by Farooq Abdullah and Omar Abdullah allied with the Congress party. The alliance won 49 seats in the 90-seat Assembly, comfortably crossing the majority mark of 46. The NC alone won 42 seats, while BJP won 29 seats, making it the single largest party though short of majority.

Omar Abdullah was sworn in as the Chief Minister of the newly constituted J&K UT assembly on October 16, 2024. However, the J&K UT operates under a Delhi-model constitutional arrangement where the Lt. Governor retains significant powers over police, public order, and certain services.`,
    why_it_matters: 'J&K statehood, Article 370, UT status, and elections are very important for UPSC GS-II (Governance, Federalism), State PSC Mains, and Banking GA. Multiple questions expected.',
    image_url: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?auto=format&fit=crop&w=800&q=80',
    category: 'Politics',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'SSC', 'Banking', 'Railway']),
    tags: JSON.stringify(['J&K Elections 2024', 'Omar Abdullah', 'National Conference', 'Article 370', 'Union Territory']),
    source_url: 'https://eci.gov.in',
    published_date: '2024-10-08',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'India\'s GDP Growth Q1 FY2024-25: 6.7% — Slowdown from 8.2% in FY24',
    summary: 'India\'s GDP grew 6.7% in Q1 FY2024-25 (Apr-Jun 2024), down from 8.2% in FY24. Manufacturing grew 7%, Services 7.7%. RBI projects 7.2% GDP for full FY25.',
    key_points: JSON.stringify([
      'Q1 FY2024-25 (April-June 2024) GDP growth: 6.7% — slowdown from Q4 FY24 (7.8%).',
      'Full year FY2023-24 GDP growth: 8.2% (highest among major economies).',
      'Manufacturing GVA growth Q1 FY25: 7%. Services sector GVA: 7.7%.',
      'Agriculture GVA Q1 FY25: 2% (sluggish due to uneven monsoon).',
      'RBI full-year FY2024-25 GDP projection: 7.2%. IMF projection: 7%.',
      'India remains world\'s fastest-growing major economy, ahead of China (4.7% in Q2 2024).'
    ]),
    content: `India\'s National Statistical Office (NSO) released Q1 FY2024-25 (April-June 2024) GDP data showing growth of 6.7%, a moderation from the 8.2% achieved in the full year FY2023-24.

The slowdown was partly attributed to base effects (Q1 FY24 had unusually strong 8.2% growth) and slower government capital expenditure in the pre-election period. Manufacturing GVA grew 7%, services 7.7%, while agriculture was sluggish at 2%.

Despite the quarter-on-quarter moderation, India remains the world\'s fastest-growing major economy, significantly ahead of China (4.7% GDP growth in Q2 2024) and the EU/US. The RBI projects full-year FY2024-25 GDP growth at 7.2%.`,
    why_it_matters: 'GDP data, growth rates, GVA by sector are tested in UPSC Prelims (Economy), RBI Grade B, NABARD, IBPS PO/Clerk, SBI PO, and all Banking exams.',
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    category: 'Economy',
    exam_tags: JSON.stringify(['UPSC', 'Banking', 'SSC', 'State PSC', 'RBI Grade B']),
    tags: JSON.stringify(['GDP India 2024', 'Economic Growth', 'FY25', 'NSO', 'GVA', 'India Economy']),
    source_url: 'https://mospi.gov.in',
    published_date: '2024-08-30',
    is_published: 1,
    is_featured: 0
  },
  {
    title: 'India Hosts SCO Summit 2024: PM Modi Chairs Virtual Summit; No Physical Meeting',
    summary: 'India hosted the SCO Council of Heads of Government summit virtually in October 2024. PM Modi chaired. Pakistan\'s PM Shehbaz Sharif participated. India is SCO Chair for 2023-24.',
    key_points: JSON.stringify([
      'India hosted SCO Council of Heads of Government (CHG) summit on October 16, 2024 — virtually.',
      'PM Modi chaired; India holds SCO Chairship for 2023-24 cycle.',
      'SCO members: India, China, Russia, Pakistan, Kazakhstan, Kyrgyzstan, Tajikistan, Uzbekistan, Iran, Belarus.',
      'India first joined SCO as full member in 2017 (alongside Pakistan).',
      'SCO Secretariat: Beijing. SCO Regional Anti-Terrorist Structure (RATS): Tashkent.',
      'Summit focus: Connectivity, anti-terrorism, digital economy, energy cooperation.'
    ]),
    content: `India hosted the Shanghai Cooperation Organisation (SCO) Council of Heads of Government (CHG) meeting virtually on October 16, 2024, with Prime Minister Narendra Modi chairing the session as India holds the SCO Chair for the 2023-24 cycle.

The meeting was held virtually — a format chosen partly due to India\'s strained ties with China and Pakistan. Pakistan\'s Prime Minister Shehbaz Sharif participated digitally. The summit discussed connectivity projects, counter-terrorism cooperation under the RATS mechanism, digital economy initiatives, and energy cooperation.

India joined the SCO as a full member in 2017, alongside Pakistan. The SCO now has 10 full members including Iran and Belarus, making it the world\'s largest regional organisation by geographical coverage and population.`,
    why_it_matters: 'SCO, multilateral organisations, India\'s role, and summits are mandatory for UPSC GS-II (International Organisations), Banking GA, SSC CGL GA, and State PSC Mains.',
    image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80',
    category: 'International',
    exam_tags: JSON.stringify(['UPSC', 'Banking', 'SSC', 'State PSC']),
    tags: JSON.stringify(['SCO Summit 2024', 'Modi', 'Shanghai Cooperation Organisation', 'India Chair', 'Multilateral']),
    source_url: 'https://mea.gov.in',
    published_date: '2024-10-16',
    is_published: 1,
    is_featured: 0
  },
  {
    title: 'Haryana & Jammu-Kashmir State Assembly Results — October 2024',
    summary: 'Haryana Assembly Election 2024: BJP won majority (48 seats) against Congress (37 seats). Nayab Singh Saini continued as CM. J&K: NC-Congress won 49 seats; Omar Abdullah CM.',
    key_points: JSON.stringify([
      'Haryana elections: October 5, 2024. Results: BJP 48, Congress 37, others 15. Total seats: 90.',
      'BJP wins Haryana for 3rd consecutive term — CM Nayab Singh Saini continued.',
      'Congress predicted to win but lost — exit polls proved wrong.',
      'J&K elections: Results October 8. NC 42, Congress 6 (alliance 49), BJP 29, PDP 3.',
      'Omar Abdullah sworn as J&K CM on October 16, 2024.',
      'Haryana and J&K elections were the first major state polls ahead of Bihar and Delhi elections.'
    ]),
    content: `Two major state assembly elections were held in October 2024 — Haryana and the first J&K assembly election since 2014.

Haryana (90 seats, results October 5): The BJP defied all pre-poll predictions and exit polls to win a clear majority with 48 seats, against Congress which won 37. Chief Minister Nayab Singh Saini, who replaced Manohar Lal Khattar mid-term, led the BJP to an unprecedented 3rd consecutive term in Haryana. Congress, which had been widely predicted to win based on anti-incumbency, underperformed significantly.

J&K (90 seats, results October 8): The National Conference-Congress alliance secured 49 seats, with NC alone winning 42. BJP won 29 seats. Omar Abdullah became the Chief Minister of the UT on October 16.`,
    why_it_matters: 'State election results, CM names, and party performance are important for all competitive exams\' Current Affairs sections. Must know for Banking GK, SSC, and State PSC 2024-25 exams.',
    image_url: 'https://images.unsplash.com/photo-1567596388756-f6d710c8fc07?auto=format&fit=crop&w=800&q=80',
    category: 'Politics',
    exam_tags: JSON.stringify(['UPSC', 'SSC', 'Banking', 'Railway', 'State PSC']),
    tags: JSON.stringify(['Haryana Elections 2024', 'J&K Elections', 'BJP', 'Omar Abdullah', 'Nayab Saini', 'State Elections']),
    source_url: 'https://eci.gov.in',
    published_date: '2024-10-08',
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'India\'s Inflation Trends 2024: CPI at 5.65% in October — Food Prices Remain Elevated',
    summary: 'India\'s CPI inflation for October 2024 at 5.65%, driven by food inflation (7.7%). Vegetable prices (36% YoY), edible oils rising. Core inflation stable at ~3.5%. RBI target: 4%.',
    key_points: JSON.stringify([
      'India CPI Inflation October 2024: 5.65% (up from 5.49% in September 2024).',
      'Food inflation October 2024: 7.68% — vegetables +36%, pulses +7.4%, edible oils +9.5%.',
      'Core inflation (ex-food & fuel) remains benign at ~3.5%.',
      'WPI (Wholesale Price Index) October 2024: 2.36%.',
      'RBI inflation target: 4% (band: 2-6%). Repo rate at 6.5% — held for 10 consecutive meets.',
      'Elevated food inflation likely to delay any RBI rate cut to Q1 2025 at earliest.'
    ]),
    content: `India\'s Consumer Price Index (CPI) based inflation rose to 5.65% in October 2024, up from 5.49% in September 2024, driven primarily by elevated food prices.

Food inflation stood at 7.68% in October, with vegetable prices surging 36% year-on-year — driven by unseasonal rainfall affecting supply chains for tomatoes, onions, and potatoes. Pulses inflation remained at 7.4% and edible oil prices rose 9.5% due to global palm oil price pressures.

Core inflation (excluding food and fuel) remained well-anchored at around 3.5%, suggesting underlying demand pressures are manageable. Wholesale Price Index (WPI) was at 2.36%.

The elevated food inflation is expected to keep the RBI MPC on hold for longer, with market economists now projecting the first rate cut no earlier than Q1 2025.`,
    why_it_matters: 'CPI/WPI inflation data, components, and RBI\'s inflation targeting mandate are extremely important for Banking exams (IBPS, SBI, RBI), UPSC Prelims Economy, and SSC CGL GA.',
    image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
    category: 'Economy',
    exam_tags: JSON.stringify(['Banking', 'UPSC', 'SSC', 'RBI Grade B', 'NABARD']),
    tags: JSON.stringify(['CPI Inflation 2024', 'Food Inflation', 'RBI', 'WPI', 'India Economy']),
    source_url: 'https://mospi.gov.in',
    published_date: '2024-11-12',
    is_published: 1,
    is_featured: 0
  },
  {
    title: 'Wayanad Landslides 2024 — Deadliest Natural Disaster in Kerala History',
    summary: 'Massive landslides struck Mundakkai-Chooralmala villages, Wayanad (Kerala) on July 30, 2024. Over 400 dead, 100+ missing. India\'s deadliest landslide disaster. National calamity declared.',
    key_points: JSON.stringify([
      'Landslides struck Mundakkai and Chooralmala villages, Wayanad, Kerala on July 30, 2024 (early morning).',
      'Death toll: Over 400 confirmed; 100+ missing. Termed Kerala\'s worst ever natural disaster.',
      'Caused by extreme rainfall (>200mm in 24 hrs) linked to southwest monsoon intensification.',
      'Rescue: Army, NDRF, Navy, Air Force, Coast Guard deployed. 1,200+ people rescued.',
      'Relief: PM\'s NDRF released ₹600 crore; Kerala government declared state calamity.',
      'Priyanka Gandhi Vadra, PM Modi visited the site. Debates on hill ecology and construction.'
    ]),
    content: `On July 30, 2024, massive landslides struck the Mundakkai and Chooralmala villages of Wayanad district, Kerala, in the early morning hours when residents were asleep. Triggered by extreme monsoon rainfall exceeding 200mm in 24 hours, multiple landslides and flash floods obliterated large portions of the plantation-dominated hillside communities.

Over 400 people were confirmed dead, with over 100 still missing, making this Kerala\'s deadliest ever natural disaster. The Indian Army, NDRF, Navy, Air Force, and Coast Guard mounted a massive rescue operation, rescuing over 1,200 survivors.

PM Modi visited the site on August 7 and announced ₹2 lakh ex-gratia for each victim\'s family. The disaster reignited debates about the Kasturirangan report on Western Ghats ecological sensitivity zones and construction regulations in ecologically sensitive areas.`,
    why_it_matters: 'Disaster management, NDRF, Western Ghats ecology, and India\'s natural disasters are important for UPSC GS-III (Disaster Management), State PSC Mains (Kerala), and GA sections.',
    image_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    category: 'General Knowledge',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'SSC', 'Banking', 'Railway']),
    tags: JSON.stringify(['Wayanad Landslide 2024', 'Kerala Disaster', 'NDRF', 'Western Ghats', 'Natural Disaster']),
    source_url: 'https://ndma.gov.in',
    published_date: '2024-07-30',
    is_published: 1,
    is_featured: 0
  },
];

// ─── ACTIVE GOVT JOBS (Oct 2024 — real active recruitments) ─────────────────
const GOVT_JOBS = [
  {
    post_name: 'UPSC Civil Services (IAS/IFS/IPS) Prelims 2025',
    department: 'Union Public Service Commission (UPSC)',
    state: 'All India',
    district: '',
    total_posts: 1129,
    open_date: '2025-01-22',
    last_date: '2025-02-11',
    eligibility: 'Bachelor\'s degree in any discipline from a recognised university. Age: 21-32 years (OBC -3, SC/ST -5 years relaxation).',
    age_limit: '21-32 years (UR); upto 35 (OBC); upto 37 (SC/ST)',
    salary_scale: '₹56,100 – ₹2,50,000 (Level 10-17 Pay Matrix)',
    application_fee: '₹100 (UR/OBC); Nil (SC/ST/Female/PwBD)',
    selection_process: 'Preliminary Exam → Main Exam (Written) → Personality Test (Interview)',
    official_notification_url: 'https://upsc.gov.in',
    apply_online_url: 'https://upsconline.nic.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 1,
    description: 'Most prestigious civil services examination in India. Recruits for IAS, IPS, IFS, and ~24 other Group A & B Central Services.'
  },
  {
    post_name: 'SSC CGL 2024-25 (Combined Graduate Level)',
    department: 'Staff Selection Commission (SSC)',
    state: 'All India',
    district: '',
    total_posts: 17727,
    open_date: '2024-09-24',
    last_date: '2024-10-13',
    eligibility: "Bachelor's degree in any discipline. Age: 18-32 years (post-wise varies). OBC -3, SC/ST -5 years relaxation.",
    age_limit: '18-32 years (varies by post)',
    salary_scale: '₹25,500 – ₹1,42,400 (Level 4-8 Pay Matrix)',
    application_fee: '₹100 (UR/OBC Male); Nil (Female/SC/ST/Ex-SM/PwBD)',
    selection_process: 'Tier-I (CBE) → Tier-II (CBE, includes Paper-III for specific posts) → Document Verification',
    official_notification_url: 'https://ssc.gov.in',
    apply_online_url: 'https://ssc.gov.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 1,
    description: 'One of India\'s largest central government recruitment exams. Posts include Income Tax Inspector, CBI Sub-Inspector, Auditor, Accountant, and more.'
  },
  {
    post_name: 'IBPS PO (Probationary Officer) 2024',
    department: 'Institute of Banking Personnel Selection (IBPS)',
    state: 'All India',
    district: '',
    total_posts: 4455,
    open_date: '2024-08-01',
    last_date: '2024-08-21',
    eligibility: "Bachelor's degree in any discipline. Age: 20-30 years. Knowledge of computer operations preferred.",
    age_limit: '20-30 years (UR); upto 33 (OBC); upto 35 (SC/ST)',
    salary_scale: '₹52,000 – ₹62,000 per month (Cost to Bank, approx)',
    application_fee: '₹850 (UR/OBC/EWS); ₹175 (SC/ST/PwBD)',
    selection_process: 'Prelims (Online) → Mains (Online) → Interview → Final Merit List',
    official_notification_url: 'https://www.ibps.in',
    apply_online_url: 'https://www.ibps.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 1,
    description: 'IBPS PO recruitment for Probationary Officer posts in 11 participating Public Sector Banks including Bank of Baroda, Punjab National Bank, Canara Bank, etc.'
  },
  {
    post_name: 'IBPS Clerk (CRP Clerks-XIV) 2024',
    department: 'Institute of Banking Personnel Selection (IBPS)',
    state: 'All India',
    district: '',
    total_posts: 6128,
    open_date: '2024-07-01',
    last_date: '2024-07-21',
    eligibility: "Bachelor's degree in any discipline. Age: 20-28 years. Knowledge of local language and computer operations required.",
    age_limit: '20-28 years (UR); upto 31 (OBC); upto 33 (SC/ST)',
    salary_scale: '₹26,000 – ₹35,000 per month (approx, varies by bank)',
    application_fee: '₹850 (UR/OBC/EWS); ₹175 (SC/ST/PwBD/Ex-SM)',
    selection_process: 'Prelims (Online) → Mains (Online) → Provisional Allotment',
    official_notification_url: 'https://www.ibps.in',
    apply_online_url: 'https://www.ibps.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 0,
    description: 'IBPS Clerk recruitment for clerical cadre posts in 11 participating Public Sector Banks. Good entry-level banking career option.'
  },
  {
    post_name: 'RRB NTPC Cycle 1 — 2024 (Non-Technical Popular Categories)',
    department: 'Railway Recruitment Board (RRB)',
    state: 'All India',
    district: '',
    total_posts: 11558,
    open_date: '2024-09-14',
    last_date: '2024-10-13',
    eligibility: 'Graduate level: Bachelor\'s in any discipline. Under-Graduate level: 12th pass. Age: 18-36 years (varies by post category).',
    age_limit: '18-36 years (post-wise); relaxation as per govt norms',
    salary_scale: '₹19,900 – ₹35,400 (Level 2-6 Pay Matrix, post-dependent)',
    application_fee: '₹500 (UR/OBC/EWS); ₹250 (SC/ST/Ex-SM/PwBD/Female/Transgender/Minority/EBC)',
    selection_process: 'CBT-1 → CBT-2 → Typing/Skill Test (for select posts) → Document Verification/Medical',
    official_notification_url: 'https://indianrailways.gov.in',
    apply_online_url: 'https://rrbapply.gov.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1474487548417-781cb6d646ef?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 1,
    description: 'Railway Recruitment Board NTPC 2024 — posts include Junior Clerk cum Typist, Accounts Clerk, Junior Time Keeper, Trains Clerk, Commercial cum Ticket Clerk, Station Master, Goods Guard, etc.'
  },
  {
    post_name: 'SBI PO 2024 (Probationary Officers)',
    department: 'State Bank of India (SBI)',
    state: 'All India',
    district: '',
    total_posts: 600,
    open_date: '2024-10-07',
    last_date: '2024-10-27',
    eligibility: "Bachelor's degree in any discipline. Age: 21-30 years. OBC -3 yrs, SC/ST -5 yrs relaxation. Computer literacy preferred.",
    age_limit: '21-30 years (UR); upto 33 (OBC); upto 35 (SC/ST)',
    salary_scale: '₹66,600 – ₹78,000 (approx CTC inclusive of perks)',
    application_fee: '₹750 (General/OBC/EWS); Nil (SC/ST/PwBD)',
    selection_process: 'Prelims (Online) → Mains (Online, Descriptive + Objective) → Group Exercise + Interview',
    official_notification_url: 'https://sbi.co.in',
    apply_online_url: 'https://bank.sbi/careers',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 1,
    description: 'SBI PO is one of the most coveted banking jobs in India. Probationary Officers join the Junior Management Grade Scale-I and have a clear path to senior management.'
  },
  {
    post_name: 'NIACL Assistant 2024 (New India Assurance Company)',
    department: 'New India Assurance Company Limited (NIACL)',
    state: 'All India',
    district: '',
    total_posts: 500,
    open_date: '2024-10-04',
    last_date: '2024-10-24',
    eligibility: "Bachelor's degree or diploma in any discipline. Age: 21-30 years.",
    age_limit: '21-30 years (UR); relaxation as per govt norms for reserved categories',
    salary_scale: '₹22,405 – ₹70,805 (Scale I as per latest revision)',
    application_fee: '₹600 (UR/OBC/EWS); ₹100 (SC/ST/PwBD)',
    selection_process: 'Prelims (Online) → Mains (Online) → Regional Language Test → Document Verification',
    official_notification_url: 'https://www.newindia.co.in',
    apply_online_url: 'https://www.newindia.co.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 0,
    description: 'New India Assurance Company Limited is recruiting Assistants for general insurance roles across India. Public sector insurance job with good perks.'
  },
  {
    post_name: 'SSC MTS & Havaldar 2024 (Multi-Tasking Staff)',
    department: 'Staff Selection Commission (SSC)',
    state: 'All India',
    district: '',
    total_posts: 9583,
    open_date: '2024-09-27',
    last_date: '2024-10-31',
    eligibility: 'Matriculation (10th Pass) from a recognised Board. Havaldar in CBIC & CBN: Same. Age: 18-25 years (MTS), 18-27 years (Havaldar).',
    age_limit: '18-25 years (MTS UR); 18-27 years (Havaldar UR); Relaxation for reserved categories',
    salary_scale: '₹18,000 – ₹22,000 per month (approx, Level 1 Pay Matrix for MTS)',
    application_fee: '₹100 (UR/OBC Male); Nil (SC/ST/Female/Ex-SM/PwBD)',
    selection_process: 'CBE Paper-I (Objective) → CBE Paper-II (Descriptive, only for MTS, qualifying) → Document Verification',
    official_notification_url: 'https://ssc.gov.in',
    apply_online_url: 'https://ssc.gov.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 0,
    description: 'SSC MTS 2024 — Multi-Tasking (Non-Technical) Staff across various Central Government Ministries/Departments/Offices. 10th pass eligible. Also includes Havaldar recruitment for CBIC & CBN.'
  },
  {
    post_name: 'Karnataka Police SI Recruitment 2024 (Sub-Inspector)',
    department: 'Karnataka State Police / KPSC',
    state: 'Karnataka',
    district: '',
    total_posts: 545,
    open_date: '2024-10-01',
    last_date: '2024-10-31',
    eligibility: "Bachelor's degree in any discipline from a recognised university. Age: 21-28 years (UR); relaxation for SC/ST/OBC as per Karnataka govt norms.",
    age_limit: '21-28 years (UR); upto 30 (OBC/Cat-IIB); upto 33 (SC/ST/Cat-I)',
    salary_scale: '₹35,900 – ₹63,700 (Level 8 Karnataka Pay Matrix)',
    application_fee: '₹200 (UR/OBC); ₹100 (SC/ST/PwBD)',
    selection_process: 'Written Exam → Physical Efficiency Test (PET) → Physical Measurement Test (PMT) → Interview → Medical',
    official_notification_url: 'https://ksp.karnataka.gov.in',
    apply_online_url: 'https://ksp.karnataka.gov.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 1,
    description: 'Karnataka State Police Sub-Inspector recruitment 2024 — covering Civil Police, Armed Police, and Intelligence. Karnataka domicile required for some categories.'
  },
  {
    post_name: 'Karnataka PSI (Police Sub Inspector) & Constable Recruitment 2024',
    department: 'Karnataka State Police',
    state: 'Karnataka',
    district: '',
    total_posts: 4000,
    open_date: '2024-09-01',
    last_date: '2024-10-20',
    eligibility: 'Constable: 10+2 (PUC) pass. PSI: Degree. Karnataka domicile required. Physical standards apply.',
    age_limit: 'Constable: 18-25 years; PSI: 21-28 years (age relaxation for reserved categories)',
    salary_scale: 'Constable: ₹21,400 – ₹42,000; PSI: ₹35,900 – ₹63,700',
    application_fee: '₹150 – ₹200 (category-wise)',
    selection_process: 'Written Exam → Physical Test → Document Verification → Medical',
    official_notification_url: 'https://ksp.karnataka.gov.in',
    apply_online_url: 'https://ksp.karnataka.gov.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 0,
    description: 'Large-scale Karnataka Police recruitment for Constables, Armed Reserve Constables, and PSI posts. Great opportunity for Karnataka youth in state police force.'
  },
  {
    post_name: 'KPSC Group-C Recruitment 2024 (Karnataka Public Service Commission)',
    department: 'Karnataka Public Service Commission (KPSC)',
    state: 'Karnataka',
    district: '',
    total_posts: 1012,
    open_date: '2024-09-15',
    last_date: '2024-10-15',
    eligibility: 'Varies by post: 10th/12th/Diploma/Degree. Kannada language proficiency required. Age: 18-35 years (varies by category).',
    age_limit: '18-35 years (varies by post and category)',
    salary_scale: '₹17,000 – ₹48,000 (varies by post/grade)',
    application_fee: '₹300 (UR); ₹150 (2A/2B/3A/3B); ₹25 (SC/ST/Cat-I)',
    selection_process: 'Written Exam (Objective/Descriptive) → Document Verification → Medical (for certain posts)',
    official_notification_url: 'https://kpsc.kar.nic.in',
    apply_online_url: 'https://kpsc.kar.nic.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 0,
    description: 'Karnataka PSC Group C recruitment covering posts in various state government departments — includes Junior Assistant, First Division Assistant, Typist, Steno, Clerk and technical posts.'
  },
  {
    post_name: 'RBI Grade B Officers 2024 (Phase-I)',
    department: 'Reserve Bank of India (RBI)',
    state: 'All India',
    district: '',
    total_posts: 94,
    open_date: '2024-10-10',
    last_date: '2024-10-31',
    eligibility: "Bachelor's degree with minimum 60% (55% SC/ST/PwBD). Age: 21-30 years (relaxation for reserved categories).",
    age_limit: '21-30 years (UR); upto 33 (OBC); upto 35 (SC/ST)',
    salary_scale: '₹1,07,150 – ₹1,75,400 per month (approx gross with HRA)',
    application_fee: '₹850 (UR/OBC/EWS); ₹100 (SC/ST/PwBD)',
    selection_process: 'Phase-I (Online Objective) → Phase-II (Descriptive + Economic Policy + Finance Papers) → Interview',
    official_notification_url: 'https://opportunities.rbi.org.in',
    apply_online_url: 'https://opportunities.rbi.org.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 1,
    description: 'RBI Grade B Officer is one of the most prestigious government jobs — executive/officer-level posts at the Reserve Bank of India. Includes General, DEPR (Economic Policy), and DSIM (Statistics) streams.'
  },
  {
    post_name: 'NABARD Grade A Officer (Assistant Manager) 2024',
    department: 'National Bank for Agriculture and Rural Development (NABARD)',
    state: 'All India',
    district: '',
    total_posts: 102,
    open_date: '2024-10-08',
    last_date: '2024-10-28',
    eligibility: "Bachelor's degree with 60% marks. Specialised streams (Agriculture, Law, HR, IT, Finance). Age: 21-30 years.",
    age_limit: '21-30 years (UR); upto 33 (OBC); upto 35 (SC/ST)',
    salary_scale: '₹44,500 – ₹89,150 per month (approx CTC)',
    application_fee: '₹800 (UR/OBC/EWS); ₹150 (SC/ST/PwBD)',
    selection_process: 'Phase-I (Prelims Online) → Phase-II (Mains Online) → Interview',
    official_notification_url: 'https://www.nabard.org',
    apply_online_url: 'https://www.nabard.org/careers',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 0,
    description: 'NABARD Grade A recruitment for Assistant Manager posts across various disciplines including agriculture, rural development, finance, IT, legal, and general banking.'
  },
  {
    post_name: 'NHM Karnataka Staff Nurse & ANM Recruitment 2024',
    department: 'National Health Mission (NHM) Karnataka',
    state: 'Karnataka',
    district: '',
    total_posts: 2000,
    open_date: '2024-09-10',
    last_date: '2024-10-10',
    eligibility: 'Staff Nurse: B.Sc Nursing / GNM. ANM: ANM Certificate course from recognised institute. Karnataka domicile preferred.',
    age_limit: '18-35 years (UR); age relaxation for SC/ST/OBC as per Karnataka norms',
    salary_scale: 'Staff Nurse: ₹21,000 – ₹32,000/month (contract); ANM: ₹12,000 – ₹15,000/month',
    application_fee: 'As applicable per notification',
    selection_process: 'Merit-based (Marks in qualifying exam) → Document Verification',
    official_notification_url: 'https://karunadu.karnataka.gov.in',
    apply_online_url: 'https://karunadu.karnataka.gov.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 0,
    description: 'NHM Karnataka recruitment for Staff Nurses and ANMs (Auxiliary Nurse Midwife) for Primary Health Centres and Community Health Centres across Karnataka districts.'
  },
  {
    post_name: 'ISRO Scientist/Engineer SC 2024',
    department: 'Indian Space Research Organisation (ISRO)',
    state: 'All India',
    district: '',
    total_posts: 320,
    open_date: '2024-10-15',
    last_date: '2024-11-07',
    eligibility: 'BE/B.Tech in relevant engineering branch (Electronics, Mechanical, Computer Science, Civil) with 65% aggregate. Age: Up to 35 years.',
    age_limit: 'Up to 35 years (UR); upto 38 (OBC); upto 40 (SC/ST)',
    salary_scale: '₹56,100 – ₹1,44,300 (Level 10 Pay Matrix) + ISRO perks',
    application_fee: '₹250 (UR/OBC); Nil (SC/ST/Female/PwBD/Ex-SM)',
    selection_process: 'Written Test (Objective) → Interview → Medical',
    official_notification_url: 'https://www.isro.gov.in',
    apply_online_url: 'https://www.isro.gov.in/careers',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 1,
    description: 'ISRO Scientist/Engineer SC recruitment — entry-level technical positions in India\'s premier space agency. Work on cutting-edge space missions including Gaganyaan, Chandrayaan-4, SpaDeX, and more.'
  },
  {
    post_name: 'DRDO JRF / Research Associate 2024-25',
    department: 'Defence Research and Development Organisation (DRDO)',
    state: 'All India',
    district: '',
    total_posts: 450,
    open_date: '2024-10-01',
    last_date: '2024-11-15',
    eligibility: 'JRF: Master\'s degree in relevant Science/Engineering with NET/GATE. RA: PhD or equivalent. Age: 28 years (JRF), 35 years (RA).',
    age_limit: 'JRF: Up to 28 years; Research Associate: Up to 35 years',
    salary_scale: 'JRF: ₹37,000/month (NET qualified); RA: ₹54,000 – ₹58,000/month',
    application_fee: 'Nil',
    selection_process: 'Shortlisting based on GATE/NET scores → Personal Interview',
    official_notification_url: 'https://www.drdo.gov.in',
    apply_online_url: 'https://drdo.gov.in/careers',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 0,
    description: 'DRDO JRF and Research Associate positions at various DRDO laboratories across India. Work on defence technology R&D projects in areas like aerospace, electronics, materials, and more.'
  },
  {
    post_name: 'AP Grama Sachivalayam Recruitment 2024 (Village Secretariat)',
    department: 'Government of Andhra Pradesh',
    state: 'Andhra Pradesh',
    district: '',
    total_posts: 10000,
    open_date: '2024-09-20',
    last_date: '2024-10-20',
    eligibility: 'Intermediate (12th pass) / Degree based on post category. Age: 18-44 years. AP domicile mandatory.',
    age_limit: '18-44 years (inclusive of all relaxations for AP residents)',
    salary_scale: '₹15,000 – ₹25,000/month (post-wise)',
    application_fee: '₹250 (UR/BC); ₹0 (SC/ST/PwBD/Ex-SM/EWS)',
    selection_process: 'Online Written Test (Computer Based) → Document Verification',
    official_notification_url: 'https://gramasachivalayam.ap.gov.in',
    apply_online_url: 'https://recruitment.gramasachivalayam.ap.gov.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 0,
    description: 'AP Grama/Ward Sachivalayam bulk recruitment for Village Revenue Officer (VRO), Digital Assistant, Welfare & Education Assistant, Panchayat Secretary and other village-level government roles.'
  },
  {
    post_name: 'TNPSC Group 4 2024 (Tamil Nadu PSC)',
    department: 'Tamil Nadu Public Service Commission (TNPSC)',
    state: 'Tamil Nadu',
    district: '',
    total_posts: 6244,
    open_date: '2024-09-02',
    last_date: '2024-09-30',
    eligibility: '10th Pass/12th Pass (depending on post). Tamil proficiency required. Age: 18-32 years (UR); age relaxation for reserved categories.',
    age_limit: '18-32 years (UR based on post); relaxation for SC/ST/MBC/BC/PwBD',
    salary_scale: '₹15,700 – ₹50,000 (post-wise, as per TNPSC bands)',
    application_fee: '₹150 (UR/OBC); ₹0 (SC/ST/PwBD/Ex-SM)',
    selection_process: 'Written Exam (Objective) → Certificate Verification',
    official_notification_url: 'https://www.tnpsc.gov.in',
    apply_online_url: 'https://www.tnpscexams.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 0,
    description: 'TNPSC Group 4 recruitment for Junior Assistant, Village Administrative Officer (VAO), and other entry-level state government posts in Tamil Nadu.'
  },
  {
    post_name: 'UPPSC PCS 2024 (UP Combined State Services)',
    department: 'Uttar Pradesh Public Service Commission (UPPSC)',
    state: 'Uttar Pradesh',
    district: '',
    total_posts: 220,
    open_date: '2024-09-28',
    last_date: '2024-10-28',
    eligibility: "Bachelor's degree in any stream. Age: 21-40 years (UR); relaxation for OBC/SC/ST/PwBD as per UP Govt norms.",
    age_limit: '21-40 years (UR); upto 43 (OBC); upto 45 (SC/ST)',
    salary_scale: '₹56,100 – ₹2,50,000 (depending on final posting in State Services)',
    application_fee: '₹125 (UR/OBC); ₹65 (SC/ST); ₹25 (PwBD)',
    selection_process: 'Prelims (Objective) → Mains (Written) → Interview',
    official_notification_url: 'https://uppsc.up.nic.in',
    apply_online_url: 'https://uppsc.up.nic.in',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 0,
    description: 'UPPSC PCS (Provincial Civil Services) exam for SDM, DSP, ACMO, ARTO, BDO, Tehsildar, and other Gazetted state government services in Uttar Pradesh.'
  },
  {
    post_name: 'Navodaya Vidyalaya Samiti (NVS) TGT/PGT/PRT Recruitment 2024',
    department: 'Navodaya Vidyalaya Samiti (NVS), Ministry of Education',
    state: 'All India',
    district: '',
    total_posts: 1377,
    open_date: '2024-10-05',
    last_date: '2024-11-04',
    eligibility: 'PGT: Post-Graduation + B.Ed. TGT: Graduation in subject + B.Ed. PRT: 12th pass + 2-year D.El.Ed / B.El.Ed. Age varies by post.',
    age_limit: 'PGT/TGT: Up to 40 years (UR); PRT: Up to 35 years; relaxation for reserved categories',
    salary_scale: 'PGT: ₹47,600 – ₹1,51,100; TGT: ₹44,900 – ₹1,42,400; PRT: ₹35,400 – ₹1,12,400',
    application_fee: '₹1,000 (UR/OBC/EWS); ₹0 (SC/ST/PwBD/Female)',
    selection_process: 'Computer Based Test → Interview/Skill Test (for select posts) → Document Verification',
    official_notification_url: 'https://navodaya.gov.in',
    apply_online_url: 'https://navodaya.gov.in/nvs/en/Recruitment/',
    vlog_url: '',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    is_published: 1,
    is_featured: 0,
    description: 'NVS Teacher recruitment for Jawahar Navodaya Vidyalayas across India — central government residential schools. Good salary, accommodation, and job security.'
  },
];

// ─── SEED FUNCTIONS ───────────────────────────────────────────────────────────

async function seedCurrentAffairs() {
  console.log('\n📰 Seeding Current Affairs...\n');
  let inserted = 0, skipped = 0;

  // Get existing titles to avoid duplicates
  let existingTitles = new Set();
  try {
    const ex = await query('SELECT title FROM current_affairs');
    existingTitles = new Set((ex.rows || []).map(r => r.title.toLowerCase().trim()));
  } catch (e) {
    console.warn('Could not fetch existing current affairs:', e.message);
  }

  for (const art of CURRENT_AFFAIRS) {
    const key = art.title.toLowerCase().trim();
    if (existingTitles.has(key)) {
      console.log(`  ⏭  SKIP  ${art.title.substring(0, 60)}...`);
      skipped++;
      continue;
    }
    try {
      await query(
        `INSERT INTO current_affairs
           (title, summary, key_points, content, why_it_matters, image_url, category,
            exam_tags, tags, source_url, published_date, is_published, is_featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          art.title, art.summary, art.key_points, art.content, art.why_it_matters,
          art.image_url, art.category, art.exam_tags, art.tags,
          art.source_url, art.published_date, art.is_published, art.is_featured
        ]
      );
      console.log(`  ✅  ${art.category.padEnd(16)} ${art.title.substring(0, 55)}...`);
      inserted++;
      existingTitles.add(key);
    } catch (err) {
      console.error(`  ❌  ERROR: ${art.title.substring(0, 50)}: ${err.message}`);
    }
  }
  console.log(`\n  ✔ Current Affairs: ${inserted} inserted, ${skipped} skipped.\n`);
}

async function seedGovtJobs() {
  console.log('\n💼 Seeding Govt Jobs...\n');
  let inserted = 0, skipped = 0;

  let existingNames = new Set();
  try {
    const ex = await query('SELECT post_name FROM govt_jobs');
    existingNames = new Set((ex.rows || []).map(r => r.post_name.toLowerCase().trim()));
  } catch (e) {
    console.warn('Could not fetch existing jobs:', e.message);
  }

  for (const job of GOVT_JOBS) {
    const key = job.post_name.toLowerCase().trim();
    if (existingNames.has(key)) {
      console.log(`  ⏭  SKIP  ${job.post_name.substring(0, 60)}`);
      skipped++;
      continue;
    }
    try {
      await query(
        `INSERT INTO govt_jobs
           (post_name, department, state, district, total_posts, open_date, last_date,
            eligibility, age_limit, salary_scale, application_fee, selection_process,
            official_notification_url, apply_online_url, vlog_url, image_url,
            is_published, is_featured, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          job.post_name, job.department, job.state, job.district || '',
          job.total_posts || 0, job.open_date, job.last_date,
          job.eligibility || '', job.age_limit || '', job.salary_scale || '',
          job.application_fee || '', job.selection_process || '',
          job.official_notification_url || '', job.apply_online_url || '',
          job.vlog_url || null, job.image_url || '',
          job.is_published ? 1 : 0, job.is_featured ? 1 : 0, job.description || '',
        ]
      );
      console.log(`  ✅  [${job.state.padEnd(14)}] ${job.post_name.substring(0, 50)}`);
      inserted++;
      existingNames.add(key);
    } catch (err) {
      console.error(`  ❌  ERROR: ${job.post_name.substring(0, 50)}: ${err.message}`);
    }
  }
  console.log(`\n  ✔ Govt Jobs: ${inserted} inserted, ${skipped} skipped.\n`);
}

async function main() {
  console.log('🌱  DreamNexa — Fresh Data Seed (Oct 2024 Current Affairs + Active Govt Jobs)\n');
  console.log('='.repeat(70));
  await seedCurrentAffairs();
  await seedGovtJobs();
  console.log('='.repeat(70));
  console.log('\n✅  All done! Run the backend and visit /admin to verify.\n');
  try { await rawPool.end(); } catch (_) {}
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
