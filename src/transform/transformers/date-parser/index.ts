import { casualDate } from './casual-date.date-formater';
import { dateWithParenthesis } from './date-with-parenthesis.date-formater';
import { fullDateFormatter } from './full-date.date-formater';
import { pixelDateFormatter } from './pixel-phone.date-formater';

const DATE_FORMATERS: ((fileName: string) => Promise<Date | null>)[] = [
  pixelDateFormatter,
  casualDate,
  fullDateFormatter,
  dateWithParenthesis
];

export async function dateFromFileName(fileName: string): Promise<Date | null> {
  for (const formater of DATE_FORMATERS) {
    const date: Date | null = await formater(fileName);
    if (date instanceof Date) return date;
  }
  return null;
}

export * from './casual-date.date-formater';
export * from './date-with-parenthesis.date-formater';
export * from './full-date.date-formater';
export * from './pixel-phone.date-formater';
