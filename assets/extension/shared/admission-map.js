/**
 * HM Nexora — VU Admission Portal Field Mapping & Parser Engine
 * Defines field mappings, board matches, and value normalizers for vu.edu.pk/apply/
 */

const NX_VU_ADMISSION_MAP = {
  signup: [
    { key: "account.nationalityRadio", type: "radio", match: ["pakistani", "foreign national", "nationality"] },
    { key: "account.fullName", type: "text", match: ["full name", "your name", "applicant name"] },
    { key: "account.cnic", type: "text", match: ["cnic", "b-form", "b form", "nicop", "personal cnic"] },
    { key: "account.email", type: "text", match: ["your email", "email address", "email"] },
    { key: "account.mobile", type: "text", match: ["your mobile", "mobile number", "mobile"] },
    { key: "account.password", type: "password", match: ["password", "enter password"] },
    { key: "account.confirmPassword", type: "password", match: ["confirm password", "re-enter password"] }
  ],
  login: [
    { key: "account.cnic", type: "text", match: ["cnic", "b-form", "b form", "username", "login id"] },
    { key: "account.password", type: "password", match: ["password"] }
  ],
  program: [
    { key: "program.studyFrom", type: "radio", match: ["within pakistan", "outside pakistan", "study location", "status"] },
    { key: "program.degree", type: "select", match: ["degree level", "degree type", "degree"] },
    { key: "program.program", type: "select", match: ["study program", "program", "program name"], not: ["degree"] },
    { key: "program.studyStatus", type: "radio", match: ["at home", "virtual campus", "study mode", "study status"] },
    { key: "program.city", type: "select", match: ["city", "campus city"], not: ["permanent"] },
    { key: "program.campus", type: "select", match: ["campus", "preferred campus", "campus name"] }
  ],
  personal: [
    { key: "personal.cnicIssuanceDate", type: "text", match: ["cnic issuance", "issuance date", "issue date"] },
    { key: "personal.fullName", type: "text", match: ["full name", "applicant name"], not: ["father", "guardian"] },
    { key: "personal.gender", type: "radio", match: ["gender", "male", "female"] },
    { key: "personal.dob", type: "dob", match: ["date of birth", "dob", "birth date"] },
    { key: "personal.nationality", type: "select", match: ["nationality", "citizenship"] },
    { key: "personal.religion", type: "select", match: ["religion", "faith"] },
    { key: "personal.motherTongue", type: "text", match: ["mother tongue", "language"] },
    { key: "personal.landline", type: "text", match: ["landline", "phone", "telephone"] },
    { key: "personal.mobile", type: "text", match: ["candidate's mobile", "candidate mobile", "mobile"] },
    { key: "personal.disability", type: "select", match: ["disability", "special need"] },
    { key: "personal.oldVuId", type: "text", match: ["old vu id", "previous vu id", "old student id"] },
    { key: "personal.country", type: "select", match: ["country"] },
    { key: "personal.cityDistrict", type: "select", match: ["city/district", "city / district", "district of permanent", "permanent district"] },
    { key: "personal.fatherName", type: "text", match: ["father's full name", "father full name", "father name"] },
    { key: "personal.fatherCnic", type: "text", match: ["father's cnic", "father cnic"] },
    { key: "personal.fatherMobile", type: "text", match: ["father's mobile", "father/guardian's mobile", "guardian's mobile"] },
    { key: "personal.guardianName", type: "text", match: ["name of guardian", "guardian name"] },
    { key: "personal.guardianRelation", type: "select", match: ["relationship with guardian", "guardian relation", "relation"] },
    { key: "personal.monthlyIncome", type: "text", match: ["monthly income", "father income", "guardian income"] },
    { key: "personal.postalAddress", type: "text", match: ["postal address", "mailing address", "current address"] },
    { key: "personal.sameAsAbove", type: "checkbox", match: ["same as above", "permanent address is same"] },
    { key: "personal.permanentAddress", type: "text", match: ["permanent address"] },
    { key: "personal.employed", type: "radio", match: ["are you employed", "employment status", "currently employed"] },
    { key: "personal.priorComputer", type: "radio", match: ["prior computer knowledge", "computer knowledge", "computer literate"] },
    { key: "personal.laptopAtHome", type: "radio", match: ["personal computer / laptop", "laptop at home", "personal computer"] },
    { key: "personal.internet", type: "radio", match: ["internet facility", "have internet"] },
    { key: "personal.howKnow", type: "radio", match: ["how did you first know", "first know about", "source of information"] },
    { key: "personal.zeroSemester", type: "radio", match: ["zero semester qualified", "zero semester"] },
    { key: "personal.nominatingDept", type: "text", match: ["nominating department", "nominated by"] },
    { key: "personal.shuhada", type: "radio", match: ["shuhada concession", "shuhada quota", "shuhada"] },
    { key: "others.interResultAwaiting", type: "radio", match: ["inter part 2 result awaiting", "result awaiting", "awaiting result"] }
  ],
  scholarship: [
    { key: "others.needBasedScholarship", type: "radio", match: ["need based scholarship", "apply for scholarship"] }
  ],
  exemption: [
    { key: "others.creditTransfer", type: "radio", match: ["credit transfer", "course exemption", "previous degree transfer"] }
  ]
};

const NX_VU_EDU_COLUMNS = [
  "qualification",
  "board",
  "rollNo",
  "regNo",
  "examType",
  "year",
  "totalMarks",
  "obtainedMarks"
];

const NX_PAK_BOARDS = [
  "BISE Lahore", "BISE Rawalpindi", "BISE Faisalabad", "BISE Gujranwala",
  "BISE Multan", "BISE Sargodha", "BISE Sahiwal", "BISE Bahawalpur",
  "BISE D.G. Khan", "Federal Board Islamabad (FBISE)", "BISE Karachi",
  "BISE Hyderabad", "BISE Sukkur", "BISE Larkana", "BISE Mirpurkhas",
  "BISE Peshawar", "BISE Abbottabad", "BISE Mardan", "BISE Swat",
  "BISE Malakand", "BISE Kohat", "BISE Bannu", "BISE D.I. Khan",
  "BISE Quetta", "BISE Turbat", "BISE Loralai", "BISE Mirpur (AJK)",
  "Technical Board / PBTE", "Cambridge / O-Level / A-Level", "Others / Foreign Board"
];

const NX_DEGREE_ALIASES = [
  { match: ["bs 4", "bs (4", "bs(4", "bachelor (4", "undergraduate"], value: "BS (4-Years)" },
  { match: ["associate degree", "adp", "associate"], value: "Associate Degree (2-Years)" },
  { match: ["bs (2.5", "bs (5th", "master", "ma", "msc"], value: "Master / BS (5th Semester)" },
  { match: ["diploma", "post graduate diploma", "pgd"], value: "Diploma" },
  { match: ["ms", "m.phil", "mphil"], value: "MS / M.Phil" }
];

const NX_PROGRAM_ALIASES = [
  { match: ["computer science", "bscs", "cs"], value: "BS Computer Science (BSCS)" },
  { match: ["software engineering", "bsse", "se"], value: "BS Software Engineering (BSSE)" },
  { match: ["information technology", "bsit", "it"], value: "BS Information Technology (BSIT)" },
  { match: ["business administration", "bba", "management"], value: "Bachelor of Business Administration (BBA)" },
  { match: ["accounting", "finance", "bsaf"], value: "BS Accounting & Finance" },
  { match: ["psychology", "bs psy"], value: "BS Psychology" },
  { match: ["mass communication", "bs mc"], value: "BS Mass Communication" },
  { match: ["english"], value: "BS English" }
];

/**
 * Normalizes string for fuzzy comparison
 */
function nxNorm(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Normalizes 13-digit Pakistani CNIC to XXXXX-XXXXXXX-X format
 */
function nxFormatCNIC(val) {
  const digits = String(val || "").replace(/\D/g, "").slice(0, 13);
  if (digits.length === 13) {
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  }
  return digits;
}

/**
 * Normalizes Date string to DD/MM/YYYY format
 */
function nxFormatDate(val) {
  if (!val) return "";
  const s = String(val).trim();
  const m = s.match(/(\d{1,2})[\/\.\-\s](\d{1,2})[\/\.\-\s](\d{4})/);
  if (m) {
    const day = m[1].padStart(2, "0");
    const mon = m[2].padStart(2, "0");
    return `${day}/${mon}/${m[3]}`;
  }
  return s;
}

/**
 * Resolves a nested object key path (e.g. "personal.fullName" -> data.personal.fullName)
 */
function nxGetPathValue(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NX_VU_ADMISSION_MAP,
    NX_VU_EDU_COLUMNS,
    NX_PAK_BOARDS,
    NX_DEGREE_ALIASES,
    NX_PROGRAM_ALIASES,
    nxNorm,
    nxFormatCNIC,
    nxFormatDate,
    nxGetPathValue
  };
} else if (typeof window !== "undefined") {
  window.NX_VU_ADMISSION_MAP = NX_VU_ADMISSION_MAP;
  window.NX_VU_EDU_COLUMNS = NX_VU_EDU_COLUMNS;
  window.NX_PAK_BOARDS = NX_PAK_BOARDS;
  window.NX_DEGREE_ALIASES = NX_DEGREE_ALIASES;
  window.NX_PROGRAM_ALIASES = NX_PROGRAM_ALIASES;
  window.nxNorm = nxNorm;
  window.nxFormatCNIC = nxFormatCNIC;
  window.nxFormatDate = nxFormatDate;
  window.nxGetPathValue = nxGetPathValue;
}
