import type { TableErrorResponse } from '../types';

export const isTableErrorResponse = (data: unknown): data is TableErrorResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    'message' in data &&
    'status' in data &&
    typeof (data as TableErrorResponse).error === 'string' &&
    typeof (data as TableErrorResponse).message === 'string' &&
    typeof (data as TableErrorResponse).status === 'number'
  );
};
