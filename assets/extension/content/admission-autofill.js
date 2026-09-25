/**
 * HM Nexora — Smart Admission Assistant Content Script
 * Handles in-page 1-tap form filling and step progression on vu.edu.pk admission pages.
 */

(() => {
  if (window.__nxAdmissionLoaded) return;
  window.__nxAdmissionLoaded = true;

  const isAdmissionPage = () => {
    const url = location.href.toLowerCase();
    const title = (document.title || "").toLowerCase();
    const body = (document.body ? document.body.innerText : "").toLowerCase();
    return url.includes("/apply") || url.includes("/admission") || title.includes("admission") || body.includes("admissions portal") || !!document.querySelector('.nav-wizard, .wizard, [id*="Admission"]');
  };

  const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

  // --- Step Detection ---
  const STEP_NAMES = {
    signup: "Account Sign Up",
    login: "Portal Login",
    program: "1. Program Selection",
    personal: "2. Personal Information",
    education: "3. Academic Qualifications",
    documents: "5. Upload Documents",
    scholarship: "4. Need-Based Scholarship",
    exemption: "Course Exemption / Transfer",
    submit: "6. Submit Application",
    unknown: "Admission Portal Page"
  };

  function nxDetectActiveStep() {
    const path = (location.pathname + location.search).toLowerCase();
    const bodyText = (document.body ? document.body.innerText : "").toLowerCase();

    if (/signup|register/i.test(path) || /create an account|sign up for admission/i.test(bodyText)) return "signup";
    if (/login|signin/i.test(path) || (/cnic/i.test(bodyText) && /password/i.test(bodyText) && !/personal information/i.test(bodyText) && !/program selection/i.test(bodyText) && !/academic qualification/i.test(bodyText))) {
      if (document.querySelector('input[type="password"]')) return "login";
    }

    // Wizard tabs in AdmissionApplication.aspx
    const activeTab = document.querySelector('.nav-wizard li.active, .wizard .active, .step.active, .selected');
    if (activeTab) {
      const t = activeTab.innerText.toLowerCase();
      if (t.includes("program")) return "program";
      if (t.includes("personal")) return "personal";
      if (t.includes("academic") || t.includes("qualification") || t.includes("education")) return "education";
      if (t.includes("scholarship")) return "scholarship";
      if (t.includes("exemption") || t.includes("transfer")) return "exemption";
      if (t.includes("document")) return "documents";
      if (t.includes("submit")) return "submit";
    }

    if (/study from|degree level|degree program|study program|study at/i.test(bodyText) && (document.querySelector('select[id*="Degree" i]') || document.querySelector('select[id*="Program" i]'))) return "program";
    if (/personal information|father's name|cnic issuance|permanent address/i.test(bodyText)) return "personal";
    if (/academic qualification|education details|matric.*total marks|intermediate.*marks|ssc.*hssc/i.test(bodyText) || document.querySelector('[id*="gvQual" i], [id*="gvEdu" i], select[id*="Board" i]')) return "education";
    if (/upload documents|attach photograph|scanned copy/i.test(bodyText)) return "documents";
    if (/need based scholarship|financial aid/i.test(bodyText)) return "scholarship";
    if (/course exemption|credit transfer/i.test(bodyText)) return "exemption";
    if (/submit application|final submit|declaration/i.test(bodyText)) return "submit";

    return "personal";
  }

  // --- DOM Event Dispatching (ASP.NET WebForms & Native) ---
  function nxDispatchEvents(el) {
    if (!el) return;
    try {
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new Event("blur", { bubbles: true }));
      if (typeof el.onchange === "function") el.onchange();
    } catch (_) {}
  }

  function nxFindFieldInput(fieldRule) {
    const inputs = [...document.querySelectorAll("input, select, textarea")].filter((el) => {
      const s = getComputedStyle(el);
      return s.display !== "none" && s.visibility !== "hidden" && el.type !== "hidden";
    });

    for (const input of inputs) {
      let labelText = "";
      if (input.id) {
        const lbl = document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
        if (lbl) labelText += " " + lbl.innerText;
      }
      const parentLabel = input.closest("label, tr, .form-group, .row, div");
      if (parentLabel) labelText += " " + parentLabel.innerText;
      if (input.name) labelText += " " + input.name;
      if (input.placeholder) labelText += " " + input.placeholder;
      if (input.id) labelText += " " + input.id;

      const normLabel = (window.nxNorm ? window.nxNorm(labelText) : labelText.toLowerCase());

      const matches = fieldRule.match.some((m) => normLabel.includes(m.toLowerCase()));
      const excluded = fieldRule.not && fieldRule.not.some((n) => normLabel.includes(n.toLowerCase()));

      if (matches && !excluded) {
        return input;
      }
    }
    return null;
  }

  function nxSelectOptionFuzzy(selectEl, targetVal) {
    if (!selectEl || !targetVal) return false;
    const targetNorm = (window.nxNorm ? window.nxNorm(targetVal) : String(targetVal).toLowerCase());
    const options = [...selectEl.options];

    // 1. Exact match
    let bestOpt = options.find((o) => (window.nxNorm ? window.nxNorm(o.text) : o.text.toLowerCase()) === targetNorm || (window.nxNorm ? window.nxNorm(o.value) : o.value.toLowerCase()) === targetNorm);
    
    // 2. Substring match
    if (!bestOpt) {
      bestOpt = options.find((o) => {
        const t = (window.nxNorm ? window.nxNorm(o.text) : o.text.toLowerCase());
        const v = (window.nxNorm ? window.nxNorm(o.value) : o.value.toLowerCase());
        return t.includes(targetNorm) || targetNorm.includes(t) || v === targetNorm;
      });
    }

    // 3. Keyword match (e.g. "Lahore" matches "BISE Lahore", "CS" matches "BS Computer Science")
    if (!bestOpt) {
      const keywords = targetNorm.split(" ").filter((k) => k.length > 2);
      bestOpt = options.find((o) => {
        const t = (window.nxNorm ? window.nxNorm(o.text) : o.text.toLowerCase());
        return keywords.some((k) => t.includes(k));
      });
    }

    if (bestOpt) {
      selectEl.value = bestOpt.value;
      nxDispatchEvents(selectEl);
      return true;
    }
    return false;
  }

  function nxCheckRadioGroup(matchKeywords, targetVal) {
    const radios = [...document.querySelectorAll('input[type="radio"]')];
    const targetNorm = (window.nxNorm ? window.nxNorm(targetVal) : String(targetVal).toLowerCase());

    for (const r of radios) {
      const parent = r.closest("label, tr, td, .radio, div") || r.parentElement;
      const text = parent ? (window.nxNorm ? window.nxNorm(parent.innerText) : parent.innerText.toLowerCase()) : "";
      if (text.includes(targetNorm) || (r.value && (window.nxNorm ? window.nxNorm(r.value) : r.value.toLowerCase()).includes(targetNorm))) {
        r.checked = true;
        nxDispatchEvents(r);
        return true;
      }
    }
    return false;
  }

  // --- Multi-Dropdown Date of Birth Handler ---
  function nxFillDateOfBirth(dobStr) {
    if (!dobStr) return false;
    const s = String(dobStr).trim();
    let day = "", month = "", year = "";

    const m1 = s.match(/(\d{1,2})[\/\.\-\s](\d{1,2})[\/\.\-\s](\d{4})/);
    const m2 = s.match(/(\d{4})[\/\.\-\s](\d{1,2})[\/\.\-\s](\d{1,2})/);

    if (m1) {
      day = m1[1];
      month = m1[2];
      year = m1[3];
    } else if (m2) {
      year = m2[1];
      month = m2[2];
      day = m2[3];
    } else {
      return false;
    }

    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthFullNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[monthNum - 1] || "";
    const monthFullName = monthFullNames[monthNum - 1] || "";

    let filledCount = 0;

    const allSelects = [...document.querySelectorAll("select")].filter((el) => {
      const s = getComputedStyle(el);
      return s.display !== "none" && s.visibility !== "hidden";
    });

    // 1. Day select
    const daySelect = allSelects.find((sel) => {
      const id = (sel.id || "").toLowerCase();
      const name = (sel.name || "").toLowerCase();
      const parentText = (sel.closest("tr, div, td")?.innerText || "").toLowerCase();
      return (id.includes("day") || name.includes("day") || (parentText.includes("date of birth") && sel.options.length > 25 && sel.options.length <= 32));
    });

    if (daySelect) {
      const dayOpt = [...daySelect.options].find((o) => parseInt(o.value, 10) === dayNum || parseInt(o.text, 10) === dayNum || o.text.trim() === day.padStart(2, "0") || o.text.trim() === String(dayNum));
      if (dayOpt) {
        daySelect.value = dayOpt.value;
        nxDispatchEvents(daySelect);
        filledCount++;
      }
    }

    // 2. Month select
    const monthSelect = allSelects.find((sel) => {
      const id = (sel.id || "").toLowerCase();
      const name = (sel.name || "").toLowerCase();
      const parentText = (sel.closest("tr, div, td")?.innerText || "").toLowerCase();
      return (id.includes("month") || name.includes("month") || id.includes("mont") || (parentText.includes("date of birth") && sel.options.length >= 12 && sel.options.length <= 14));
    });

    if (monthSelect) {
      const monthOpt = [...monthSelect.options].find((o) => {
        const t = o.text.trim().toLowerCase();
        const v = o.value.trim().toLowerCase();
        return (
          parseInt(v, 10) === monthNum ||
          parseInt(t, 10) === monthNum ||
          t === month.padStart(2, "0") ||
          t.startsWith(monthName.toLowerCase()) ||
          t.startsWith(monthFullName.toLowerCase()) ||
          v.startsWith(monthName.toLowerCase())
        );
      });
      if (monthOpt) {
        monthSelect.value = monthOpt.value;
        nxDispatchEvents(monthSelect);
        filledCount++;
      }
    }

    // 3. Year select
    const yearSelect = allSelects.find((sel) => {
      const id = (sel.id || "").toLowerCase();
      const name = (sel.name || "").toLowerCase();
      const parentText = (sel.closest("tr, div, td")?.innerText || "").toLowerCase();
      return (id.includes("year") || name.includes("year") || (parentText.includes("date of birth") && sel.options.length > 40));
    });

    if (yearSelect) {
      const yearOpt = [...yearSelect.options].find((o) => o.value.trim() === year || o.text.trim() === year);
      if (yearOpt) {
        yearSelect.value = yearOpt.value;
        nxDispatchEvents(yearSelect);
        filledCount++;
      }
    }

    // 4. Single text input
    const dobInput = document.querySelector('input[id*="DOB" i], input[name*="DOB" i], input[id*="Birth" i]');
    if (dobInput && dobInput.type !== "hidden") {
      dobInput.value = `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
      nxDispatchEvents(dobInput);
      filledCount++;
    }

    return filledCount > 0;
  }

  // --- Step 1: Program Selection Filler ---
  async function nxFillProgramStep(profile) {
    const report = { step: "program", filled: [], missing: [], skipped: [] };
    const prog = profile.program || {};

    // 1. Study Location
    const locFilled = nxCheckRadioGroup(["within pakistan", "outside pakistan", "study location"], prog.studyFrom || "within pakistan");
    if (locFilled) report.filled.push("Study Location (Within Pakistan)");

    // 2. Degree Level (e.g. BS 4-Years)
    const degSelect = document.querySelector('select[id*="Degree" i], select[name*="Degree" i]') || nxFindFieldInput({ match: ["degree level", "degree"] });
    if (degSelect) {
      const targetDeg = prog.degree || "BS (4-Years)";
      nxSelectOptionFuzzy(degSelect, targetDeg);
      report.filled.push("Degree Level (" + targetDeg + ")");
      await SLEEP(400); // Allow ASP.NET UpdatePanel postback
    }

    // 3. Study Program / Course (e.g. BSCS)
    const progSelect = document.querySelector('select[id*="Program" i], select[name*="Program" i], select[id*="Course" i]') || nxFindFieldInput({ match: ["study program", "program name", "program"], not: ["degree"] });
    if (progSelect) {
      const targetProg = prog.program || "BS Computer Science (BSCS)";
      nxSelectOptionFuzzy(progSelect, targetProg);
      report.filled.push("Study Program (" + targetProg + ")");
    }

    // 4. Study Mode (At Home)
    const modeFilled = nxCheckRadioGroup(["at home", "virtual campus", "study mode", "study status"], prog.studyStatus || "at home");
    if (modeFilled) report.filled.push("Study Mode (At Home)");

    // 5. Campus City
    const citySelect = document.querySelector('select[id*="City" i], select[id*="CampusCity" i]') || nxFindFieldInput({ match: ["campus city", "city"], not: ["permanent"] });
    if (citySelect) {
      const targetCity = prog.city || "Lahore";
      nxSelectOptionFuzzy(citySelect, targetCity);
      report.filled.push("Campus City (" + targetCity + ")");
    }

    return report;
  }

  // --- Step 2: Personal Information Filler ---
  async function nxFillPersonalStep(profile) {
    const report = { step: "personal", filled: [], missing: [], skipped: [] };
    const p = profile.personal || {};
    const acc = profile.account || {};

    const fullName = p.fullName || acc.fullName || "Student Applicant";
    const gender = p.gender || "Female";
    const dob = p.dob || "15/08/2004";
    const cnicIssue = p.cnicIssuanceDate || "10/01/2022";
    const religion = p.religion || "Islam";
    const nationality = p.nationality || "Pakistani";
    const motherTongue = p.motherTongue || "Urdu";
    const fatherName = p.fatherName || ("Muhammad " + (fullName.split(" ").pop() || "Arshad"));
    const fatherCnic = p.fatherCnic || "35201-7654321-1";
    const fatherMobile = p.fatherMobile || acc.mobile || "03211234567";
    const city = p.cityDistrict || profile.program?.city || "Lahore";
    const postal = p.postalAddress || ("House # 12, Street 3, Main Bazar, " + city);
    const income = p.monthlyIncome || "50000";

    // 1. Full Name
    const nameInput = document.querySelector('input[id*="FullName" i], input[id*="ApplicantName" i], input[name*="FullName" i]') || nxFindFieldInput({ match: ["full name", "applicant name"], not: ["father", "guardian"] });
    if (nameInput) {
      nameInput.value = fullName;
      nxDispatchEvents(nameInput);
      report.filled.push("Full Name (" + fullName + ")");
    }

    // 2. Gender
    const genderFilled = nxCheckRadioGroup(["male", "female", "transgender", "gender"], gender);
    if (genderFilled) report.filled.push("Gender (" + gender + ")");

    // 3. Date of Birth
    const dobFilled = nxFillDateOfBirth(dob);
    if (dobFilled) report.filled.push("Date of Birth (" + dob + ")");

    // 4. CNIC Issuance Date
    const issueInput = document.querySelector('input[id*="Issue" i], input[name*="Issue" i], input[id*="CNICDate" i]') || nxFindFieldInput({ match: ["cnic issuance", "issuance date", "issue date"] });
    if (issueInput) {
      issueInput.value = (window.nxFormatDate ? window.nxFormatDate(cnicIssue) : cnicIssue);
      nxDispatchEvents(issueInput);
      report.filled.push("CNIC Issuance Date");
    }

    // 5. Nationality & Country
    const natSelect = document.querySelector('select[id*="Nationality" i], select[id*="Citizenship" i]') || nxFindFieldInput({ match: ["nationality", "citizenship"] });
    if (natSelect) {
      nxSelectOptionFuzzy(natSelect, nationality);
      report.filled.push("Nationality (" + nationality + ")");
    }

    const countrySelect = document.querySelector('select[id*="Country" i]') || nxFindFieldInput({ match: ["country"] });
    if (countrySelect) {
      nxSelectOptionFuzzy(countrySelect, "Pakistan");
    }

    // 6. Religion (Default Islam)
    const relSelect = document.querySelector('select[id*="Religion" i]') || nxFindFieldInput({ match: ["religion", "faith"] });
    if (relSelect) {
      nxSelectOptionFuzzy(relSelect, religion);
      report.filled.push("Religion (" + religion + ")");
    }

    // 7. Mother Tongue
    const tongueInput = document.querySelector('input[id*="MotherTongue" i], select[id*="MotherTongue" i], input[id*="Language" i]') || nxFindFieldInput({ match: ["mother tongue", "language"] });
    if (tongueInput) {
      if (tongueInput.tagName.toLowerCase() === "select") nxSelectOptionFuzzy(tongueInput, motherTongue);
      else { tongueInput.value = motherTongue; nxDispatchEvents(tongueInput); }
      report.filled.push("Mother Tongue");
    }

    // 8. Disability (Default None / No)
    const disSelect = document.querySelector('select[id*="Disability" i], select[id*="Special" i]') || nxFindFieldInput({ match: ["disability", "special need"] });
    if (disSelect) {
      nxSelectOptionFuzzy(disSelect, "None");
      report.filled.push("Disability");
    }

    // 9. Father Name
    const fNameInput = document.querySelector('input[id*="FatherName" i], input[id*="Father_Name" i]') || nxFindFieldInput({ match: ["father's full name", "father name", "father full name"] });
    if (fNameInput) {
      fNameInput.value = fatherName;
      nxDispatchEvents(fNameInput);
      report.filled.push("Father Name (" + fatherName + ")");
    }

    // 10. Father CNIC
    const fCnicInput = document.querySelector('input[id*="FatherCNIC" i], input[id*="Father_CNIC" i]') || nxFindFieldInput({ match: ["father's cnic", "father cnic"] });
    if (fCnicInput) {
      fCnicInput.value = (window.nxFormatCNIC ? window.nxFormatCNIC(fatherCnic) : fatherCnic);
      nxDispatchEvents(fCnicInput);
      report.filled.push("Father CNIC");
    }

    // 11. Father Mobile
    const fMobileInput = document.querySelector('input[id*="FatherMobile" i], input[id*="GuardianMobile" i]') || nxFindFieldInput({ match: ["father's mobile", "guardian's mobile", "guardian mobile"] });
    if (fMobileInput) {
      fMobileInput.value = fatherMobile;
      nxDispatchEvents(fMobileInput);
      report.filled.push("Father Mobile");
    }

    // 12. Guardian Relationship
    const guardianRelSelect = document.querySelector('select[id*="GuardianRel" i], select[id*="Relationship" i]') || nxFindFieldInput({ match: ["relationship with guardian", "guardian relation", "relation"] });
    if (guardianRelSelect) {
      nxSelectOptionFuzzy(guardianRelSelect, "Father");
    }

    // 13. Monthly Income
    const incomeInput = document.querySelector('input[id*="Income" i], input[id*="MonthlyIncome" i]') || nxFindFieldInput({ match: ["monthly income", "father income", "guardian income"] });
    if (incomeInput) {
      incomeInput.value = income;
      nxDispatchEvents(incomeInput);
      report.filled.push("Monthly Income");
    }

    // 14. Permanent District / City
    const districtSelect = document.querySelector('select[id*="District" i], select[id*="City" i]') || nxFindFieldInput({ match: ["city/district", "city / district", "permanent district", "district"] });
    if (districtSelect) {
      nxSelectOptionFuzzy(districtSelect, city);
      report.filled.push("Permanent District (" + city + ")");
    }

    // 15. Postal Address & Permanent Address
    const postalInput = document.querySelector('input[id*="Postal" i], textarea[id*="Postal" i], input[id*="Mailing" i]') || nxFindFieldInput({ match: ["postal address", "mailing address", "current address"] });
    if (postalInput) {
      postalInput.value = postal;
      nxDispatchEvents(postalInput);
      report.filled.push("Postal Address");
    }

    const permInput = document.querySelector('input[id*="Permanent" i], textarea[id*="Permanent" i]') || nxFindFieldInput({ match: ["permanent address"] });
    if (permInput) {
      permInput.value = postal;
      nxDispatchEvents(permInput);
    }

    const sameChk = document.querySelector('input[id*="Same" i][type="checkbox"], input[id*="chkSame" i]');
    if (sameChk) {
      sameChk.checked = true;
      nxDispatchEvents(sameChk);
    }

    // 16. Survey Radios (Employed, Computer, Laptop, Internet, Source)
    nxCheckRadioGroup(["employed", "employment"], "No");
    nxCheckRadioGroup(["computer knowledge", "prior computer"], "Yes");
    nxCheckRadioGroup(["laptop", "personal computer"], "Yes");
    nxCheckRadioGroup(["internet facility", "have internet"], "Yes");
    nxCheckRadioGroup(["how did you first know", "source of information"], "Internet");
    nxCheckRadioGroup(["shuhada concession", "shuhada quota"], "No");
    nxCheckRadioGroup(["inter part 2 result awaiting", "result awaiting"], "No");

    return report;
  }

  // --- Step 3: Academic Qualifications (Matric & Intermediate) Filler ---
  async function nxFillEducationStep(profile) {
    const report = { step: "education", filled: [], missing: [], skipped: [] };
    const eduList = profile.education || [];

    const matric = eduList[0] || { board: "BISE Lahore", rollNo: "123456", year: "2022", obtainedMarks: "950", totalMarks: "1100" };
    const inter = eduList[1] || { board: "BISE Lahore", rollNo: "654321", year: "2024", obtainedMarks: "980", totalMarks: "1100" };

    // Find table rows or GridView rows for Matric and Intermediate
    const allRows = [...document.querySelectorAll("tr, .form-row, .row")];
    
    // 1. Process Matric Row
    const matricRow = allRows.find((r) => /matric|ssc|o-level|secondary/i.test(r.innerText)) || document;
    
    const matricBoardSelect = matricRow.querySelector('select[id*="Board" i], select[name*="Board" i]') || document.querySelector('select[id*="Matric" i][id*="Board" i], select[id*="SSC" i][id*="Board" i], select[id*="Board" i]');
    if (matricBoardSelect) {
      nxSelectOptionFuzzy(matricBoardSelect, matric.board || "BISE Lahore");
      report.filled.push("Matric Board (" + (matric.board || "BISE Lahore") + ")");
    }

    const matricRollInput = matricRow.querySelector('input[id*="Roll" i], input[name*="Roll" i]') || document.querySelector('input[id*="Matric" i][id*="Roll" i], input[id*="SSC" i][id*="Roll" i]');
    if (matricRollInput) {
      matricRollInput.value = matric.rollNo || "123456";
      nxDispatchEvents(matricRollInput);
      report.filled.push("Matric Roll No");
    }

    const matricYearSelect = matricRow.querySelector('select[id*="Year" i], input[id*="Year" i]') || document.querySelector('select[id*="Matric" i][id*="Year" i]');
    if (matricYearSelect) {
      if (matricYearSelect.tagName.toLowerCase() === "select") nxSelectOptionFuzzy(matricYearSelect, matric.year || "2022");
      else { matricYearSelect.value = matric.year || "2022"; nxDispatchEvents(matricYearSelect); }
      report.filled.push("Matric Passing Year");
    }

    const matricObtInput = matricRow.querySelector('input[id*="Obt" i], input[name*="Obt" i]') || document.querySelector('input[id*="Matric" i][id*="Obt" i]');
    if (matricObtInput) {
      matricObtInput.value = matric.obtainedMarks || "950";
      nxDispatchEvents(matricObtInput);
      report.filled.push("Matric Obtained Marks (" + (matric.obtainedMarks || "950") + ")");
    }

    const matricTotInput = matricRow.querySelector('input[id*="Tot" i], input[name*="Tot" i], input[id*="Max" i]') || document.querySelector('input[id*="Matric" i][id*="Tot" i]');
    if (matricTotInput) {
      matricTotInput.value = matric.totalMarks || "1100";
      nxDispatchEvents(matricTotInput);
      report.filled.push("Matric Total Marks (" + (matric.totalMarks || "1100") + ")");
    }

    const matricExamSelect = matricRow.querySelector('select[id*="ExamType" i], select[id*="Type" i]');
    if (matricExamSelect) {
      nxSelectOptionFuzzy(matricExamSelect, "Annual");
    }

    // 2. Process Intermediate Row
    const interRow = allRows.find((r) => /inter|hssc|fsc|ics|fa|a-level|higher/i.test(r.innerText));
    if (interRow) {
      const interBoardSelect = interRow.querySelector('select[id*="Board" i], select[name*="Board" i]');
      if (interBoardSelect) {
        nxSelectOptionFuzzy(interBoardSelect, inter.board || matric.board || "BISE Lahore");
        report.filled.push("Inter Board (" + (inter.board || "BISE Lahore") + ")");
      }

      const interRollInput = interRow.querySelector('input[id*="Roll" i], input[name*="Roll" i]');
      if (interRollInput) {
        interRollInput.value = inter.rollNo || "654321";
        nxDispatchEvents(interRollInput);
        report.filled.push("Inter Roll No");
      }

      const interYearSelect = interRow.querySelector('select[id*="Year" i], input[id*="Year" i]');
      if (interYearSelect) {
        if (interYearSelect.tagName.toLowerCase() === "select") nxSelectOptionFuzzy(interYearSelect, inter.year || "2024");
        else { interYearSelect.value = inter.year || "2024"; nxDispatchEvents(interYearSelect); }
        report.filled.push("Inter Passing Year");
      }

      const interObtInput = interRow.querySelector('input[id*="Obt" i], input[name*="Obt" i]');
      if (interObtInput) {
        interObtInput.value = inter.obtainedMarks || "980";
        nxDispatchEvents(interObtInput);
        report.filled.push("Inter Obtained Marks (" + (inter.obtainedMarks || "980") + ")");
      }

      const interTotInput = interRow.querySelector('input[id*="Tot" i], input[name*="Tot" i], input[id*="Max" i]');
      if (interTotInput) {
        interTotInput.value = inter.totalMarks || "1100";
        nxDispatchEvents(interTotInput);
        report.filled.push("Inter Total Marks (" + (inter.totalMarks || "1100") + ")");
      }

      const interExamSelect = interRow.querySelector('select[id*="ExamType" i], select[id*="Type" i]');
      if (interExamSelect) {
        nxSelectOptionFuzzy(interExamSelect, "Annual");
      }
    } else {
      // Direct search for Inter fields
      const interBoardSelect = document.querySelector('select[id*="Inter" i][id*="Board" i], select[id*="HSSC" i][id*="Board" i]');
      if (interBoardSelect) {
        nxSelectOptionFuzzy(interBoardSelect, inter.board || "BISE Lahore");
        report.filled.push("Inter Board");
      }
      const interRollInput = document.querySelector('input[id*="Inter" i][id*="Roll" i], input[id*="HSSC" i][id*="Roll" i]');
      if (interRollInput) {
        interRollInput.value = inter.rollNo || "654321";
        nxDispatchEvents(interRollInput);
        report.filled.push("Inter Roll No");
      }
      const interObtInput = document.querySelector('input[id*="Inter" i][id*="Obt" i], input[id*="HSSC" i][id*="Obt" i]');
      if (interObtInput) {
        interObtInput.value = inter.obtainedMarks || "980";
        nxDispatchEvents(interObtInput);
        report.filled.push("Inter Obtained Marks");
      }
    }

    return report;
  }

  // --- Step 4 & 5: Scholarship & Course Exemption Filler ---
  async function nxFillScholarshipStep(profile) {
    const report = { step: "scholarship", filled: [], missing: [], skipped: [] };
    nxCheckRadioGroup(["need based scholarship", "apply for scholarship", "scholarship"], "No");
    report.filled.push("Need-Based Scholarship Option");
    return report;
  }

  async function nxFillExemptionStep(profile) {
    const report = { step: "exemption", filled: [], missing: [], skipped: [] };
    nxCheckRadioGroup(["credit transfer", "course exemption", "previous degree transfer"], "No");
    report.filled.push("Course Exemption Option");
    return report;
  }

  // --- Master Step Filler Router ---
  async function nxFillCurrentStep(profile) {
    const step = nxDetectActiveStep();
    if (!profile) {
      return { step, filled: [], missing: ["No active student profile loaded."], skipped: [] };
    }

    if (step === "program") {
      return await nxFillProgramStep(profile);
    }
    if (step === "personal") {
      return await nxFillPersonalStep(profile);
    }
    if (step === "education") {
      return await nxFillEducationStep(profile);
    }
    if (step === "scholarship") {
      return await nxFillScholarshipStep(profile);
    }
    if (step === "exemption") {
      return await nxFillExemptionStep(profile);
    }

    // Fallback: try filling program, personal, and education in sequence
    const pRep = await nxFillPersonalStep(profile);
    return pRep;
  }

  // --- Floating UI Widget ---
  let gBubble = null;
  let gPanel = null;

  async function nxGetActiveProfile() {
    try {
      const res = await chrome.storage.local.get("nx_active_admission_profile");
      return res.nx_active_admission_profile || null;
    } catch (_) {
      return null;
    }
  }

  function nxCreateFloatingWidget() {
    if (!isAdmissionPage()) return;
    if (document.getElementById("nx-admission-bubble")) return;

    gBubble = document.createElement("div");
    gBubble.id = "nx-admission-bubble";
    gBubble.className = "nx-admission-bubble";
    gBubble.title = "HM Nexora — VU Admission Assistant";
    gBubble.innerHTML = `🎓<span class="nx-admission-badge"></span>`;

    gPanel = document.createElement("div");
    gPanel.id = "nx-admission-panel";
    gPanel.className = "nx-admission-panel nx-admission-hidden";
    gPanel.innerHTML = `
      <div class="nx-adm-head">
        <div class="nx-adm-title-wrap">
          <span class="nx-adm-brand">HM NEXORA</span>
          <span class="nx-adm-tag">Admission Hub</span>
        </div>
        <button type="button" class="nx-adm-close" id="nx-adm-close-btn">&times;</button>
      </div>
      <div class="nx-adm-body">
        <div class="nx-adm-card">
          <div class="nx-adm-row">
            <span class="nx-adm-label">Active Applicant</span>
            <span class="nx-adm-val" id="nx-adm-student-name">Loading...</span>
          </div>
          <div class="nx-adm-row" style="margin-top:4px;">
            <span class="nx-adm-label">Detected Step</span>
            <span class="nx-adm-pill" id="nx-adm-step-pill">Detecting...</span>
          </div>
        </div>

        <div class="nx-adm-status" id="nx-adm-status-msg">
          Ready to 1-Tap Autofill current admission step.
        </div>

        <div class="nx-adm-actions">
          <button type="button" class="nx-adm-btn nx-adm-btn-primary" id="nx-adm-fill-btn">
            ⚡ 1-Tap Fill Step
          </button>
          <button type="button" class="nx-adm-btn nx-adm-btn-secondary" id="nx-adm-mgr-btn">
            ⚙️ Profiles
          </button>
        </div>

        <div class="nx-adm-report" id="nx-adm-report-box"></div>
      </div>
    `;

    document.body.appendChild(gBubble);
    document.body.appendChild(gPanel);

    gBubble.addEventListener("click", () => {
      gPanel.classList.toggle("nx-admission-hidden");
      nxUpdateWidgetState();
    });

    gPanel.querySelector("#nx-adm-close-btn").addEventListener("click", () => {
      gPanel.classList.add("nx-admission-hidden");
    });

    gPanel.querySelector("#nx-adm-mgr-btn").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "OPEN_ADMISSION_MANAGER" });
    });

    gPanel.querySelector("#nx-adm-fill-btn").addEventListener("click", async () => {
      const fillBtn = gPanel.querySelector("#nx-adm-fill-btn");
      fillBtn.disabled = true;
      fillBtn.textContent = "⏳ Filling...";

      const profile = await nxGetActiveProfile();
      const report = await nxFillCurrentStep(profile);

      fillBtn.disabled = false;
      fillBtn.textContent = "⚡ 1-Tap Fill Step";

      const reportBox = gPanel.querySelector("#nx-adm-report-box");
      reportBox.innerHTML = `
        <div class="nx-adm-report-ok">✓ ${report.filled.length} fields filled successfully</div>
        ${report.missing.length ? `<div class="nx-adm-report-err">✕ ${report.missing.length} missing</div>` : ""}
      `;
    });

    nxUpdateWidgetState();
  }

  async function nxUpdateWidgetState() {
    if (!gPanel) return;
    const profile = await nxGetActiveProfile();
    const nameEl = gPanel.querySelector("#nx-adm-student-name");
    const stepEl = gPanel.querySelector("#nx-adm-step-pill");

    if (nameEl) nameEl.textContent = profile?.personal?.fullName || profile?.account?.fullName || "No Profile Selected";
    if (stepEl) {
      const step = nxDetectActiveStep();
      stepEl.textContent = STEP_NAMES[step] || step;
    }
  }

  // --- Init on DOM Ready ---
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", nxCreateFloatingWidget);
  } else {
    nxCreateFloatingWidget();
  }
})();
