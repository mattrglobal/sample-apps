import { type AxiosRequestConfig } from "axios";
import { type Schema, z } from "zod";

export const buildAxiosConfig = (token: string): AxiosRequestConfig => {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getSchemaDefaultValues = (schema: Schema) => {
  return Object.fromEntries(
    Object.entries(schema).map(([key, value]) => {
      if (value instanceof z.ZodDefault)
        return [key, value._def.defaultValue()];
      return [key, undefined];
    })
  );
};

export const copyToClipboard = (e: string) => navigator.clipboard.writeText(e);

export const toCamel = (string: string): string => {
  return string.replace(/(?:_| |\b)(\w)/g, function ($1) {
    return $1.toUpperCase().replace("_", " ");
  });
};

export const waiting = (s: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, s);
  });
};
