/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ILogger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

export const LOGGER_TOKEN = Symbol('LOGGER_TOKEN'); 