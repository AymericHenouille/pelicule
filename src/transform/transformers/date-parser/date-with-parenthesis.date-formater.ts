export async function dateWithParenthesis(date: string): Promise<Date | null> {
  const dateByName: RegExpMatchArray | null = date.match(/\d{8}(?=\(\d{6}\))/);
  if (dateByName) {
    const matchDate: string = dateByName[0];
    const year: number = parseInt(matchDate.substring(0, 4));
    const month: number = parseInt(matchDate.substring(4, 6));
    const day: number = parseInt(matchDate.substring(6, 8));
    return new Date(year, month - 1, day);
  }
  return null;
}