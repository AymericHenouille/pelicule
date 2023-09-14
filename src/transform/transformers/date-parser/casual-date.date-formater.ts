export async function casualDate(date: string): Promise<Date | null> {
  const dateByName: RegExpMatchArray | null = date.match(/\d{4}-\d{2}-\d{2}/);
  if (dateByName) {
    const matchDate: string = dateByName[0];
    const year: number = parseInt(matchDate.substring(0, 4));
    const month: number = parseInt(matchDate.substring(5, 7));
    const day: number = parseInt(matchDate.substring(8, 9));
    return new Date(year, month - 1, day);
  }
  return null;
}