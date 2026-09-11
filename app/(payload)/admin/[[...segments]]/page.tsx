import { getPayloadHMR } from '@payloadcms/next/utilities';
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise });
  const { generatePageMetadata } = await import('@payloadcms/next/views');
  return generatePageMetadata({ config: payload.config });
}

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const { RootPage } = await import('@payloadcms/next/views');
  const payload = await getPayload({ config: configPromise });

  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;
  const segments: string[] = resolvedParams?.segments ?? [];

  return RootPage({
    config: Promise.resolve(payload.config),
    importMap: payload.importMap,
    params: { segments: segments },
    searchParams: resolvedSearchParams,
  });
}
