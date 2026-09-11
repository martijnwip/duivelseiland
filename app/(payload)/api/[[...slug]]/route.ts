import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
} from '@payloadcms/next/routes';

const config = await import('@payload-config');

export const GET = REST_GET(config.default);
export const POST = REST_POST(config.default);
export const PATCH = REST_PATCH(config.default);
export const OPTIONS = REST_OPTIONS(config.default);
export const DELETE = REST_DELETE(config.default);
