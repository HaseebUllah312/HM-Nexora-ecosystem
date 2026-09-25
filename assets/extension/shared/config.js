
const NEXORA = {
  name: "HM Nexora",
  version: "2.1.0",
  whatsappChannel: "https://whatsapp.com/channel/0029Vb5PcRb11ulIA5AYpj2K",
  apiBase: "https://nexora-api.haseebsaleem312.workers.dev",
  website: "https://hmnexora.tech",
  selectors: {
    subjectCardCandidates: [
      ".card", ".course-card", ".subject-card", ".panel", ".ibox", ".course-item"
    ],
    questionCandidates: [
      ".question", ".quiz-question", ".question-container", ".qtext", ".que"
    ],
    optionCandidates: [
      "label", ".answer", ".option", ".answers li", ".answer-option"
    ]
  }
};
