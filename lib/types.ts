export type Check = { id: string; category: string; title: string; pass: boolean; evidence: string; fix: string; weight: number };
export type Scan = { id: string; target: string; kind: 'url'|'repo'; status: 'queued'|'running'|'complete'|'failed'; createdAt: string; startedAt?: string; finishedAt?: string; score?: number; checks: Check[]; pages: number; scope: string; ownerHash: string; paid: boolean; demo: boolean; error?: string };
export type Summary = Omit<Scan,'ownerHash'|'checks'|'paid'> & { checks: Omit<Check,'evidence'|'fix'>[] };
export function summary(scan: Scan): Summary {
  const { ownerHash, paid, checks, ...rest } = scan;
  void ownerHash; void paid;
  return {...rest,checks:checks.map(({evidence,fix,...check})=>{void evidence;void fix;return check;})};
}
