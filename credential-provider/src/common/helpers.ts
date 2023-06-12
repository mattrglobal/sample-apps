import { GetNgrokUrlArgs } from '@/types/get-ngrok-url.args';
import * as ngrok from 'ngrok';

export const getNgrokUrl = async (args: GetNgrokUrlArgs): Promise<string> => {
  return await ngrok.connect(args).catch((error) => {
    console.error('Failed to establish Ngrok tunnel', error);
    process.exit(1);
  });
};

export const logger = (msg: string) => console.log(msg);

export const addYears = (date: Date, years: number): Date => {
  date.setFullYear(date.getFullYear() + years);
  return date;
};

export const createResponseToken = (token: string): string => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};
