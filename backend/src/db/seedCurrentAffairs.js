'use strict';

const pool = require('./pool').pool || require('./db');
const crypto = require('crypto');

const sampleArticles = [
  {
    title: 'Union Cabinet Approves ₹12,000 Cr National AI & Supercomputing Mission Phase-2',
    summary: 'The Indian government has expanded the National AI Mission to deploy sovereign AI compute clusters across top academic institutions and student research centers.',
    key_points: JSON.stringify([
      '₹12,000 Crore total outlay allocated for 2026-2029.',
      'Deployment of 15,000+ GPUs for academic and student startup access.',
      'Establishment of AI Centers of Excellence in 25 Central Universities.',
      'Focus areas include Agriculture, Vernacular Healthcare, and Defense AI.'
    ]),
    content: `The Union Cabinet, chaired by the Prime Minister, has officially approved Phase-2 of the National Artificial Intelligence and Supercomputing Mission with a budget of ₹12,000 Crore.

Under this phase, the government will build sovereign AI compute infrastructure accessible to Indian students, researchers, and early-stage AI startups at subsidized rates. 

The initiative aims to reduce dependence on foreign cloud platforms and build foundational LLMs for 22 scheduled Indian languages.`,
    why_it_matters: 'Highly relevant for UPSC GS-III (Technology & AI), SSC CGL Science & Tech, and Bank PO General Awareness sections.',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    category: 'Science & Tech',
    exam_tags: JSON.stringify(['UPSC', 'SSC', 'Banking', 'Railway']),
    tags: JSON.stringify(['AI Mission', 'Supercomputing', 'Digital India']),
    source_url: 'https://pib.gov.in',
    published_date: new Date().toISOString().split('T')[0],
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'Parliament Enacts Electoral Reforms Bill 2026 for Digital Voter Identity Verification',
    summary: 'Key amendments to the Representation of the People Act introduced real-time election monitoring, standardized voter mapping, and strict campaign spending limits.',
    key_points: JSON.stringify([
      'Amends Representation of the People Act, 1951.',
      'Mandates biometrically verified e-Voter IDs for NRI and migrant voters.',
      'Caps individual candidate campaign expenditure with mandatory digital ledger reporting.',
      'Establishes an independent Election Tech Advisory Board.'
    ]),
    content: `Both houses of Parliament have passed the Landmark Electoral Reforms Bill 2026, introducing significant modernizations to India's voting ecosystem.

The bill introduces remote digital voting facilities for registered migrant workers and defense personnel while maintaining end-to-end cryptographic verification.`,
    why_it_matters: 'Crucial topic for Polity & Governance in UPSC GS-II, State PSC Mains, and Judicial Services Exams.',
    image_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    category: 'Politics',
    exam_tags: JSON.stringify(['UPSC', 'State PSC', 'Law Exams']),
    tags: JSON.stringify(['Polity', 'Parliament', 'Elections']),
    source_url: 'https://sansad.in',
    published_date: new Date().toISOString().split('T')[0],
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'RBI Keeps Repo Rate Unchanged at 6.25% in Bi-Monthly Monetary Policy Review',
    summary: 'The Reserve Bank of India maintained monetary stance at Neutral, citing controlled retail inflation at 4.1% and robust domestic GDP growth of 7.2%.',
    key_points: JSON.stringify([
      'Repo Rate stands at 6.25%; Reverse Repo Rate at 3.35%.',
      'CPI Inflation target projected at 4.1% for FY 2026-27.',
      'Real GDP Growth projected at 7.2% driven by domestic manufacturing.',
      'New liquidity window announced for Green Energy bonds.'
    ]),
    content: `The Monetary Policy Committee (MPC) of the Reserve Bank of India (RBI) decided unanimously to keep the policy repo rate unchanged at 6.25%.

RBI Governor highlighted that core inflation has stabilized within the target band of 4% (+/- 2%), supported by bumper agricultural harvest and stable energy supply lines.`,
    why_it_matters: 'Directly asked in RBI Grade B, SBI PO, IBPS Banking Awareness, and UPSC Economy.',
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    category: 'Economy',
    exam_tags: JSON.stringify(['Banking', 'RBI Grade B', 'UPSC', 'SSC']),
    tags: JSON.stringify(['RBI', 'Repo Rate', 'Monetary Policy']),
    source_url: 'https://rbi.org.in',
    published_date: new Date().toISOString().split('T')[0],
    is_published: 1,
    is_featured: 0
  },
  {
    title: 'UNESCO Names Ancient Harappan Port of Lothal as World Heritage Site',
    summary: 'Lothal in Gujarat, one of the earliest known tidal dockyards in human history, becomes India\'s 43rd UNESCO World Heritage Site.',
    key_points: JSON.stringify([
      'Located in the Bhal region of Gujarat, dating back to 2400 BCE.',
      'Features the world\'s oldest known artificial dockyard connected to an ancient course of the Sabarmati river.',
      'India\'s total World Heritage Site count increases to 43.',
      'National Maritime Heritage Complex (NMHC) being constructed nearby.'
    ]),
    content: `UNESCO's World Heritage Committee has officially inscribed the ancient Indus Valley site of Lothal onto the World Heritage list.

Lothal was a thriving trade center in antiquity, exporting beads, gems, and precious ornaments to Mesopotamia and Egypt.`,
    why_it_matters: 'Top question candidate for Ancient History & Culture in UPSC Prelims, SSC CGL, and Railway Exams.',
    image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    category: 'Social Science',
    exam_tags: JSON.stringify(['UPSC', 'SSC', 'Railway', 'State PSC']),
    tags: JSON.stringify(['UNESCO', 'Indus Valley', 'Lothal', 'History']),
    source_url: 'https://unesco.org',
    published_date: new Date().toISOString().split('T')[0],
    is_published: 1,
    is_featured: 1
  },
  {
    title: 'National Student Scholarship Scheme 2026 Launched for Higher Education Aspirants',
    summary: 'Ministry of Education introduces direct tuition fee subsidies up to ₹50,000/year for undergraduate students in STEM, Humanities, and Commerce.',
    key_points: JSON.stringify([
      'Subsidizes up to ₹50,000 annual fee for eligible university students.',
      'Selection based on National Merit-cum-Means test score.',
      'Integrated with DigiLocker and PM Vidya Lakshmi portal.',
      'Reserves 30% seats for female STEM scholars.'
    ]),
    content: `The Ministry of Education has launched the upgraded PM National Student Scholarship Scheme 2026 aimed at reducing higher education dropout rates.

Students enrolled in accredited degree programs can apply online via the National Scholarship Portal (NSP).`,
    why_it_matters: 'Essential knowledge for Schemes & Government Policies section in all competitive exams.',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    category: 'Student Corner',
    exam_tags: JSON.stringify(['UPSC', 'SSC', 'Banking', 'Railway', 'GATE']),
    tags: JSON.stringify(['Scholarships', 'Education', 'Student Welfare']),
    source_url: 'https://scholarships.gov.in',
    published_date: new Date().toISOString().split('T')[0],
    is_published: 1,
    is_featured: 0
  }
];

async function seed() {
  console.log('Seeding sample current affairs...');
  try {
    for (const art of sampleArticles) {
      const id = crypto.randomUUID();
      await pool.query(
        `INSERT INTO current_affairs 
         (id, title, summary, key_points, content, why_it_matters, image_url, category, exam_tags, tags, source_url, published_date, is_published, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          art.title,
          art.summary,
          art.key_points,
          art.content,
          art.why_it_matters,
          art.image_url,
          art.category,
          art.exam_tags,
          art.tags,
          art.source_url,
          art.published_date,
          art.is_published,
          art.is_featured
        ]
      );
    }
    console.log('✔ Successfully seeded sample current affairs!');
  } catch (err) {
    console.error('Error seeding current affairs:', err);
  } finally {
    process.exit(0);
  }
}

seed();
