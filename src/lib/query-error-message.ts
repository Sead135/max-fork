export function queryErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (error) {
    return fallback;
  }
  return '';
}
