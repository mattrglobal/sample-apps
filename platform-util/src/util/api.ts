import axios, { AxiosRequestConfig, Method } from 'axios';

type RequestConfig = {
  baseUrl: string;
  accessToken: string;
  timeoutMs: number;
};

type RequestOptions = {
  urlPath: string;
  config: RequestConfig;
  body?: unknown;
  params?: unknown;
};

const getAxiosConfig = (
  method: Method,
  options: RequestOptions,
): AxiosRequestConfig => {
  const {
    urlPath,
    body,
    params,
    config: { timeoutMs, baseUrl, accessToken },
  } = options;
  return {
    method,
    url: urlPath,
    baseURL: baseUrl,
    timeout: timeoutMs,
    data: body,
    params,
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };
};

const get = async <ResBody>(options: RequestOptions): Promise<ResBody> => {
  const { data } = await axios.request(getAxiosConfig('GET', options));
  return data;
};

const post = async <ResBody>(options: RequestOptions): Promise<ResBody> => {
  const { data } = await axios.request(getAxiosConfig('POST', options));
  return data;
};

const put = async <ResBody>(options: RequestOptions): Promise<ResBody> => {
  const { data } = await axios.request(getAxiosConfig('PUT', options));
  return data;
};

const del = async (options: RequestOptions): Promise<void> => {
  await axios.request(getAxiosConfig('DELETE', options));
};

export const api = { get, post, put, del };
