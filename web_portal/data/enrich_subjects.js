const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const subjectsJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'subjects.json'), 'utf8'));

// OFFICIAL MAPPING FROM USER
const OFFICIAL_MAP = {
    // ACC
    "ACC311": { name: "Fundamentals of Auditing", desc: "Introduction to accounting principles, financial statements, and basic recording of business transactions. Covers assets, liabilities, and equity." },
    "ACC501": { name: "Business Finance", desc: "Focuses on preparation and analysis of financial statements, accounting standards, and reporting practices." },
    "ACC707": { name: "Advanced Accounting", desc: "Covers complex accounting topics like consolidations, partnerships, and advanced financial reporting." },
    // BIF
    "BIF101": { name: "Introduction to Bioinformatics", desc: "Overview of computational tools used in biology, including databases, sequence analysis, and basic algorithms." },
    "BIF401": { name: "Bioinformatics I", desc: "Covers biological data analysis, sequence alignment, and introduction to genomics tools." },
    "BIF402": { name: "Bioinformatics II", desc: "Advanced topics like protein structure prediction, molecular modeling, and phylogenetics." },
    "BIF501": { name: "Genomics and Proteomics", desc: "Study of genome sequencing, gene expression, and protein analysis using computational methods." },
    "BIF601": { name: "Computational Biology", desc: "Focus on algorithm design for biological problems and large dataset analysis." },
    "BIF602": { name: "Structural Bioinformatics", desc: "Deals with 3D structure of biomolecules and computational modeling techniques." },
    "BIF731": { name: "Advanced Genomics", desc: "Explores next-generation sequencing and large-scale genome analysis." },
    "BIF732": { name: "Systems Biology", desc: "Study of complex biological systems using computational models." },
    "BIF733": { name: "Data Mining in Bioinformatics", desc: "Applies machine learning and data mining techniques to biological datasets." },
    // BIO
    "BIO101": { name: "Introduction to Biology", desc: "Basic concepts of life sciences including cell structure, genetics, and evolution." },
    "BIO102": { name: "Basic Biology II", desc: "Continuation of BIO101 focusing on plant and animal systems and ecology." },
    "BIO201": { name: "Cell Biology", desc: "Detailed study of cell structure, organelles, and cellular processes." },
    "BIO202": { name: "Genetics", desc: "Principles of heredity, DNA structure, gene expression, and inheritance patterns." },
    "BIO203": { name: "Microbiology", desc: "Study of microorganisms, including bacteria, viruses, and fungi." },
    "BIO204": { name: "Biochemistry", desc: "Covers chemical processes in living organisms, including proteins, enzymes, and metabolism." },
    "BIO301": { name: "Molecular Biology", desc: "Focus on DNA replication, transcription, and translation." },
    "BIO302": { name: "Ecology", desc: "Study of ecosystems, environmental interactions, and biodiversity." },
    "BIO303": { name: "Evolutionary Biology", desc: "Explores evolution theories, natural selection, and species adaptation." },
    "BIO401": { name: "Physiology", desc: "Study of functions of organs and systems in living organisms." },
    "BIO502": { name: "Advanced Cell Biology", desc: "In-depth analysis of cellular mechanisms and signaling pathways." },
    "BIO503": { name: "Immunology", desc: "Study of the immune system, antibodies, and disease defense mechanisms." },
    "BIO504": { name: "Developmental Biology", desc: "Covers organism growth, embryonic development, and cell differentiation." },
    "BIO505": { name: "Biotechnology", desc: "Application of biological systems in technology, including genetic engineering." },
    "BIO506": { name: "Environmental Biology", desc: "Focus on environmental issues, conservation, and sustainability." },
    "BIO731": { name: "Advanced Molecular Biology", desc: "Advanced genetic techniques and molecular research methods." },
    "BIO732": { name: "Advanced Genetics", desc: "Complex inheritance patterns and genomic studies." },
    "BIO733": { name: "Neurobiology", desc: "Study of the nervous system and brain functions." },
    "BIO734": { name: "Research Methods in Biology", desc: "Focus on experimental design, data analysis, and scientific writing." },
    // BNK
    "BNK601": { name: "Principles of Banking", desc: "Introduction to banking systems, functions of banks, and financial intermediation." },
    "BNK603": { name: "Credit Management", desc: "Covers lending principles, credit analysis, and risk assessment in banks." },
    "BNK604": { name: "Islamic Banking", desc: "Focus on Shariah-compliant banking practices and financial products." },
    "BNK610": { name: "Bank Operations", desc: "Deals with day-to-day banking activities, clearing systems, and customer services." },
    "BNK611": { name: "Risk Management in Banks", desc: "Study of financial risks and techniques to manage them." },
    "BNK612": { name: "Investment Banking", desc: "Covers mergers, acquisitions, underwriting, and capital markets." },
    "BNK613": { name: "Financial Markets & Institutions", desc: "Overview of financial systems, markets, and regulatory frameworks." },
    // BT
    "BT101": { name: "Introduction to Biotechnology", desc: "Basic concepts and applications of biotechnology in various fields." },
    "BT102": { name: "Cell Biology & Genetics", desc: "Focus on cell structure and genetic principles in biotech context." },
    "BT201": { name: "Microbial Biotechnology", desc: "Use of microorganisms in industrial and medical applications." },
    "BT301": { name: "Molecular Biotechnology", desc: "Genetic engineering techniques and DNA manipulation." },
    "BT302": { name: "Bioprocess Engineering", desc: "Industrial processes involving biological materials." },
    "BT401": { name: "Plant Biotechnology", desc: "Genetic modification and improvement of plants." },
    "BT402": { name: "Animal Biotechnology", desc: "Applications of biotechnology in animals and medicine." },
    "BT403": { name: "Immunotechnology", desc: "Use of immune system components in technology and diagnostics." },
    "BT404": { name: "Environmental Biotechnology", desc: "Biotech solutions for pollution control and waste management." },
    "BT405": { name: "Industrial Biotechnology", desc: "Production of bio-products like enzymes, biofuels, etc." },
    "BT406": { name: "Bioinformatics in Biotechnology", desc: "Application of computational tools in biotech research." },
    "BT501": { name: "Advanced Biotechnology", desc: "Advanced concepts and emerging technologies in biotech." },
    "BT503": { name: "Genetic Engineering", desc: "Detailed techniques of gene cloning and modification." },
    "BT504": { name: "Biostatistics", desc: "Statistical methods applied to biological research." },
    "BT505": { name: "Research Methods in Biotechnology", desc: "Experimental design and lab techniques." },
    "BT511": { name: "Bioethics", desc: "Ethical issues in biotechnology and genetic research." },
    "BT601": { name: "Pharmaceutical Biotechnology", desc: "Drug development using biological systems." },
    "BT603": { name: "Food Biotechnology", desc: "Use of biotechnology in food production and safety." },
    "BT605": { name: "Nanobiotechnology", desc: "Application of nanotechnology in biological systems." },
    "BT731": { name: "Advanced Genetic Engineering", desc: "High-level gene editing and CRISPR techniques." },
    "BT732": { name: "Proteomics", desc: "Study of protein structures and functions." },
    "BT733": { name: "Genomics", desc: "Large-scale study of genomes." },
    "BT734": { name: "Systems Biotechnology", desc: "Integrated study of biological systems." },
    "BT735": { name: "Biotechnology Research Project", desc: "Hands-on research and thesis work." },
    // CHE
    "CHE201": { name: "Organic Chemistry", desc: "Study of carbon compounds, reactions, and mechanisms." },
    "CHE301": { name: "Analytical Chemistry", desc: "Techniques for chemical analysis and laboratory testing." },
    // CS
    "CS001": { name: "Basic IT Literacy", desc: "Introduction to computers, internet, and basic software tools." },
    "CS101": { name: "Introduction to Computing", desc: "Basic computing concepts, hardware, software, and problem-solving." },
    "CS201": { name: "Introduction to Programming", desc: "Programming fundamentals (variables, loops, functions)." },
    "CS202": { name: "Discrete Mathematics", desc: "Logic, sets, relations, graphs, and mathematical reasoning." },
    "CS204": { name: "Digital Logic Design", desc: "Basic logic gates, circuits, and digital systems." },
    "CS205": { name: "Information Security", desc: "Fundamentals of data protection, encryption, and security principles." },
    "CS206": { name: "Data Structures", desc: "Study of arrays, linked lists, stacks, queues, and trees." },
    "CS301": { name: "Data Structures & Algorithms", desc: "Covers efficient data handling and algorithms (sorting, searching, trees, graphs). Highly important for interviews.", difficulty: "Hard" },
    "CS302": { name: "Digital Logic & Design", desc: "Advanced digital systems, Boolean algebra, and circuit design." },
    "CS304": { name: "Object-Oriented Programming", desc: "Concepts like classes, inheritance, polymorphism, and abstraction. Foundation for modern development.", difficulty: "Hard" },
    "CS310": { name: "Software Engineering", desc: "Software development lifecycle, project management, and design methodologies." },
    "CS311": { name: "Automata Theory", desc: "Study of computation models like finite automata and Turing machines." },
    "CS312": { name: "Computer Networks", desc: "Covers networking concepts, protocols (TCP/IP), and communication systems." },
    "CS314": { name: "Compiler Construction", desc: "How programming languages are translated into machine code." },
    "CS315": { name: "Operating Systems", desc: "Processes, memory management, file systems, and scheduling.", difficulty: "Hard" },
    "CS401": { name: "Database Systems", desc: "Design and management of databases using SQL and normalization.", difficulty: "Hard" },
    "CS403": { name: "Human Computer Interaction", desc: "Designing user-friendly interfaces and usability principles." },
    "CS405": { name: "Computer Graphics", desc: "Rendering, 2D/3D graphics, and visualization techniques." },
    "CS407": { name: "Artificial Intelligence", desc: "Search algorithms, knowledge representation, and intelligent systems.", difficulty: "Hard" },
    "CS408": { name: "Software Project Management", desc: "Planning, scheduling, and managing software projects." },
    "CS409": { name: "Computer Architecture", desc: "Internal structure of computers, processors, and memory systems." },
    "CS410": { name: "Professional Practices", desc: "Ethics, communication, and professional skills in IT." },
    "CS411": { name: "Visual Programming", desc: "Development of GUI-based applications." },
    "CS432": { name: "Software Testing", desc: "Testing techniques to ensure software quality." },
    "CS435": { name: "E-Commerce", desc: "Online business systems, payment gateways, and security." },
    "CS501": { name: "Advanced Computer Architecture", desc: "Modern processor design and performance optimization." },
    "CS502": { name: "Distributed Systems", desc: "Systems running on multiple machines, cloud computing basics.", difficulty: "Hard" },
    "CS504": { name: "Software Engineering II", desc: "Advanced development methodologies and architecture." },
    "CS505": { name: "Web Programming", desc: "Frontend and backend web development (HTML, CSS, JS, server-side).", difficulty: "Medium" },
    "CS506": { name: "Data Warehousing & Mining", desc: "Handling large datasets and extracting insights." },
    "CS507": { name: "Information Systems", desc: "Managing IT systems in organizations." },
    "CS508": { name: "Modern Programming Languages", desc: "Concepts of different programming paradigms." },
    "CS510": { name: "Software Requirement Engineering", desc: "Requirement gathering and system specification." },
    "CS511": { name: "Mobile Application Development", desc: "Building apps for Android/iOS platforms.", difficulty: "Hard" },
    "CS601": { name: "Data Communication", desc: "Fundamentals of data transmission and communication systems." },
    "CS606": { name: "Network Security", desc: "Security protocols, encryption, and cyber defense.", difficulty: "Hard" },
    "CS610": { name: "Machine Learning", desc: "Algorithms that allow systems to learn from data. Essential for AI careers.", difficulty: "Very Hard" },
    "CS619": { name: "Final Year Project", desc: "Complete real-world project development. Most important for your portfolio.", difficulty: "Very Hard" },
    "CS621": { name: "Cloud Computing", desc: "Cloud platforms, virtualization, distributed services.", difficulty: "Hard" },
    "CS627": { name: "Computer Vision", desc: "Image processing and visual recognition.", difficulty: "Hard" },
    "CS636": { name: "Deep Learning", desc: "Neural networks, CNNs, and advanced AI models.", difficulty: "Very Hard" },
    // 700 Level CS
    "CS701": { name: "Advanced Software Engineering", desc: "Focus on large-scale software systems, architecture, and modern practices." },
    "CS713": { name: "Data Science", desc: "Data analysis, visualization, and predictive modeling for modern tech careers." },
    // ECO
    "ECO302": { name: "Microeconomics", desc: "Consumer behavior, demand/supply, and market structures." },
    "ECO401": { name: "Advanced Microeconomics", desc: "In-depth analysis of market behavior and decision-making." },
    // EDU
    "EDU101": { name: "Introduction to Education", desc: "Basic concepts, philosophy, and importance of education." },
    // ENG
    "ENG101": { name: "English Comprehension", desc: "Basic reading, writing, and grammar skills." },
    "ENG201": { name: "Business & Technical English", desc: "Professional writing and communication skills." },
    // FIN
    "FIN611": { name: "Financial Management", desc: "Covers financial planning, budgeting, and investment decisions." },
    // HRM
    "HRM611": { name: "Human Resource Management", desc: "Basics of hiring, training, and employee management." },
    // MGT
    "MGT101": { name: "Principles of Management", desc: "Basic management functions: planning, organizing, leading." },
    "MGT211": { name: "Business Communication", desc: "Professional communication skills." },
    // MKT
    "MKT501": { name: "Marketing Management", desc: "Marketing strategies, branding, and consumer behavior." },
    "MKT726": { name: "Digital Marketing", desc: "Online marketing, SEO, social media, and ads." },
    // MTH
    "MTH101": { name: "Calculus I", desc: "Limits, derivatives, and applications." },
    "MTH202": { name: "Discrete Mathematics", desc: "Logic, sets, and graphs. Essential for Computer Science." },
    "MTH301": { name: "Linear Algebra", desc: "Matrices, vectors, and transformations." },
    // PSY
    "PSY101": { name: "Introduction to Psychology", desc: "Basic concepts of human behavior and mental processes." },
    // SOC
    "SOC101": { name: "Introduction to Sociology", desc: "Study of society and social behavior." },
    // Special
    "ISL201": { name: "Islamic Studies", desc: "Basic Islamic teachings and ethical values." },
    "PAK301": { name: "Pakistan Studies", desc: "History and ideology of Pakistan." },
    "PHY101": { name: "Physics", desc: "Fundamental physics concepts and their applications." }
};

const CATEGORY_MAP = {
    "ACC": "Management", "BIF": "Science", "BIO": "Science", "BNK": "Management", "BT": "Science", "CHE": "Science",
    "CS": "Computer Science", "ECO": "Management", "EDU": "General", "ENG": "English", "FIN": "Management",
    "HRM": "Management", "ISL": "General", "MCM": "General", "MGMT": "Management", "MGT": "Management", "MKT": "Management",
    "MTH": "Mathematics", "PAK": "General", "PHY": "Science", "PSY": "General", "SOC": "General", "STA": "Mathematics",
    "URD": "General", "URU": "General", "VU": "General", "ZOO": "Science"
};

function getCategory(code) {
    const prefix = code.replace(/[0-9]/g, '');
    return CATEGORY_MAP[prefix] || "General";
}

async function runOfficialEnrichment() {
    console.log(`Enriching subjects with official user-provided data...`);
    
    const enriched = subjectsJson.map(code => {
        const official = OFFICIAL_MAP[code];
        const prefix = code.replace(/[0-9]/g, '');
        const category = getCategory(code);
        
        let name = code + " - Advanced Studies";
        let description = `Study materials and solved papers for ${code}.`;
        let difficulty = "Medium";

        if (official) {
            name = official.name;
            description = official.desc;
            difficulty = official.difficulty || "Medium";
        }

        return {
            code: code.toUpperCase(),
            name: name,
            description: description,
            category: category,
            difficulty: difficulty
        };
    });

    const BATCH_SIZE = 50;
    for (let i = 0; i < enriched.length; i += BATCH_SIZE) {
        const batch = enriched.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('subjects').upsert(batch, { onConflict: 'code' });
        
        if (error) {
            console.error(`Error in batch ${i/BATCH_SIZE + 1}:`, error);
        } else {
            console.log(`✓ Batch ${i/BATCH_SIZE + 1} (${batch.length} items) processed.`);
        }
    }

    console.log('Official enrichment complete!');
}

runOfficialEnrichment();
