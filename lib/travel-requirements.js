export const PASSPORT_COUNTRIES = [
  "Brasil",
  "Argentina",
  "Austrália",
  "Canadá",
  "Chile",
  "China",
  "Colômbia",
  "Estados Unidos",
  "França",
  "Alemanha",
  "Índia",
  "Itália",
  "Japão",
  "México",
  "Portugal",
  "Reino Unido",
  "Espanha",
  "Outra nacionalidade",
];

export const TRAVEL_DESTINATIONS = [
  {
    code: "PT",
    name: "Portugal",
    currency: "EUR",
    rule: {
      kind: "conditional-fixed",
      entryAmount: 75,
      dailyAmount: 40,
      currency: "EUR",
      condition: "A fonte descreve esta regra para titulares de visto Schengen; ela não é aplicada automaticamente a toda nacionalidade.",
      checkedAt: "17/07/2026",
      sourceName: "Ministério dos Negócios Estrangeiros de Portugal",
      sourceUrl: "https://vistos.mne.gov.pt/pt/vistos-schengen/documentacao-instrutoria/meios-de-subsistencia",
    },
  },
  {
    code: "GB",
    name: "Reino Unido",
    currency: "GBP",
    rule: {
      kind: "no-universal-minimum",
      summary: "A orientação oficial exige demonstrar que a pessoa consegue se sustentar e pagar a viagem de saída; ela também admite financiamento por outra pessoa. A página não fixa um valor diário universal.",
      checkedAt: "11/11/2026",
      sourceName: "GOV.UK — Standard Visitor",
      sourceUrl: "https://www.gov.uk/standard-visitor",
    },
  },
  {
    code: "US",
    name: "Estados Unidos",
    currency: "USD",
    rule: {
      kind: "unconfirmed",
      checkedAt: "11/11/2026",
      sourceName: "U.S. Department of State — Visitor Visa",
      sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html",
    },
  },
  {
    code: "CA",
    name: "Canadá",
    currency: "CAD",
    rule: {
      kind: "unconfirmed",
      checkedAt: "11/11/2026",
      sourceName: "Governo do Canadá — Visitor visa",
      sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/visitor-visa.html",
    },
  },
  {
    code: "AU",
    name: "Austrália",
    currency: "AUD",
    rule: {
      kind: "unconfirmed",
      checkedAt: "11/11/2026",
      sourceName: "Department of Home Affairs — Visitor visa",
      sourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/visitor-600/tourist-stream-overseas",
    },
  },
];

export function calculateTravelRequirement(rule, days, travelers) {
  const stayDays = Number(days);
  const travelerCount = Number(travelers);
  if (!Number.isInteger(stayDays) || stayDays < 1 || stayDays > 3650) {
    throw new RangeError("A duração deve ser um número de dias entre 1 e 3.650.");
  }
  if (!Number.isInteger(travelerCount) || travelerCount < 1 || travelerCount > 100) {
    throw new RangeError("Informe entre 1 e 100 viajantes.");
  }
  if (!rule || !Number.isFinite(rule.dailyAmount) || rule.dailyAmount < 0
    || !Number.isFinite(rule.entryAmount) || rule.entryAmount < 0) {
    return null;
  }
  const perTraveler = rule.entryAmount + rule.dailyAmount * stayDays;
  return { perTraveler, total: perTraveler * travelerCount, dailyPerTraveler: rule.dailyAmount };
}

export function compareTravelBudget(budget, rate, requirement) {
  const amount = Number(budget);
  const exchangeRate = Number(rate);
  if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    throw new RangeError("Informe orçamento e câmbio válidos.");
  }
  if (!requirement || !Number.isFinite(requirement.total)) return null;
  const convertedBudget = amount * exchangeRate;
  return {
    convertedBudget,
    difference: convertedBudget - requirement.total,
    meets: convertedBudget >= requirement.total,
  };
}
