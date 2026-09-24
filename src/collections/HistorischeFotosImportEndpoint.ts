import type { PayloadHandler } from 'payload';
import { fetchBeeldbankMetadata } from '../lib/beeldbank';

export const historischeFotosImportEndpoint: PayloadHandler = async (req) => {
  if (!req.user) {
    return Response.json({ message: 'Niet ingelogd.' }, { status: 401 });
  }

  const body = (await req.json?.()) as { link?: string; geografischeAanduiding?: string } | undefined;
  const link = body?.link;
  const geografischeAanduiding = body?.geografischeAanduiding;

  if (!link) {
    return Response.json({ message: 'Geen link opgegeven.' }, { status: 400 });
  }

  let metadata;
  try {
    metadata = await fetchBeeldbankMetadata(link);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Importeren mislukt.';
    return Response.json({ message }, { status: 400 });
  }

  const doc = await req.payload.create({
    collection: 'historische-fotos',
    overrideAccess: true,
    data: {
      title: metadata.title,
      description: metadata.description,
      imageUrl: metadata.imageUrl,
      datering: metadata.datering,
      vervaardiger: metadata.vervaardiger,
      rechten: metadata.rechten,
      bronUrl: link,
      geografischeAanduiding,
      status: 'draft',
    },
  });

  return Response.json({ doc }, { status: 201 });
};
