import { getPayload } from 'payload';
import config from '../../src/payload.config';

export async function getClient() {
  return getPayload({ config });
}
