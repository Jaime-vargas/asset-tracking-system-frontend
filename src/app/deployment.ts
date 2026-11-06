const configuredOrigin = (window as Window & { ASSETS_CONTROL_BACKEND_ORIGIN?: string })
  .ASSETS_CONTROL_BACKEND_ORIGIN?.trim();

function resolveBackendOrigin(value: string | undefined): string {
  if (!value) return '';
  const url = new URL(value);
  if (url.protocol !== 'https:' || (value !== url.origin && value !== url.origin + '/')) {
    throw new Error('Configure the backend as an HTTPS origin, without a path.');
  }
  return url.origin;
}

export const backendOrigin = resolveBackendOrigin(configuredOrigin);
