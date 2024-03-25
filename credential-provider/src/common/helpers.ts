import { GetNgrokUrlArgs } from '@/types/get-ngrok-url.args';
import * as ngrok from '@ngrok/ngrok';

export const getNgrokUrl = async (args: GetNgrokUrlArgs): Promise<string> => {
  const { port, authtoken } = args;
  const ngrokListener = await ngrok.forward({ addr: port, authtoken: authtoken });
  return ngrokListener.url();
};

export const logger = (msg: string) => console.log(msg);

export const addYears = (date: Date, years: number): Date => {
  date.setFullYear(date.getFullYear() + years);
  return date;
};
