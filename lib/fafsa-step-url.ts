/** URL-safe link to a FAFSA step detail page (plan keys contain colons). */
export function fafsaStepHref(planKey: string) {
  return `/fafsa/steps/${encodeURIComponent(planKey)}`;
}

export function parseFafsaStepPlanKey(param: string) {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}
