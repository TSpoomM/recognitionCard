type SearchablePerson = {
  primary: string[];
  secondary?: string[];
};

export function normalizePeopleSearchText(value: string | undefined | null) {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function getInitials(values: string[]) {
  return values
    .flatMap((value) => normalizePeopleSearchText(value).split(" "))
    .filter(Boolean)
    .map((part) => part[0])
    .join("");
}

function scoreValues(values: string[], query: string, baseScore: number) {
  const normalizedValues = values.map(normalizePeopleSearchText).filter(Boolean);
  const combined = normalizePeopleSearchText(normalizedValues.join(" "));
  const tokens = combined.split(" ").filter(Boolean);

  if (combined.startsWith(query)) return baseScore;
  if (tokens.some((token) => token.startsWith(query))) return baseScore + 1;
  if (getInitials(normalizedValues).startsWith(query)) return baseScore + 2;

  return null;
}

export function peopleSearchScore(person: SearchablePerson, rawQuery: string) {
  const query = normalizePeopleSearchText(rawQuery);
  if (!query) return 0;

  const primaryScore = scoreValues(person.primary, query, 0);
  if (primaryScore !== null) return primaryScore;

  if (query.length < 3) return null;

  const secondaryScore = scoreValues(person.secondary || [], query, 20);
  if (secondaryScore !== null) return secondaryScore;

  return null;
}
