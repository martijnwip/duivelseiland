import type { Metadata } from 'next';

import config from '@payload-config';
import { generatePageMetadata, RootPage } from '@payloadcms/next/views';

import { importMap } from '../importMap.js';

type Args = {
  params: Promise<{
    segments?: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

const Page = ({ params, searchParams }: Args) =>
  // `RootPage`'s type requires `segments` to be present, but its own route-matching
  // logic depends on it being `undefined` (not `[]`) for the bare `/admin` route —
  // see the trailing-slash bug this file works around.
  RootPage({ config, importMap, params: params as Promise<{ segments: string[] }>, searchParams });

export default Page;
