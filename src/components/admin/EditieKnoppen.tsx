'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ConfirmationModal, toast, useAuth, useDocumentInfo, useFormFields, useFormModified, useModal } from '@payloadcms/ui';
import { useOmgeving } from './omgeving';

type Ontvangers = { totaal: number; nl: number; en: number; dagen: number; engelsLeeg: boolean; opProductie: boolean };

const MODAL = 'nieuwsbrief-versturen';

/**
 * Knoppen bovenaan een nieuwsbrief-editie (redacteur of admin): voorbeeld, testmail, versturen en stoppen.
 * Het werk gebeurt op de server (src/endpoints/nieuwsbriefEdities.ts); versturen vraagt eerst om bevestiging
 * met het aantal ontvangers.
 */
export default function EditieKnoppen() {
  const { id } = useDocumentInfo();
  const { user } = useAuth<{ role?: string; email?: string }>();
  const omgeving = useOmgeving();
  const router = useRouter();
  const modified = useFormModified();
  const { openModal } = useModal();
  const status = useFormFields(([fields]) => fields.status?.value) as string | undefined;
  const [bezig, setBezig] = useState(false);
  const [ontvangers, setOntvangers] = useState<Ontvangers | null>(null);

  const redactie = user?.role === 'redacteur' || user?.role === 'admin';
  if (id === undefined || !redactie) return null;

  const api = async (pad: string, method: 'GET' | 'POST' = 'POST') => {
    const res = await fetch(`/api/nieuwsbrief-edities/${id}/${pad}`, { method, credentials: 'include' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message ?? 'Er ging iets mis.');
    return json;
  };

  const actie = async (fn: () => Promise<void>) => {
    if (modified) {
      toast.error('Sla eerst je wijzigingen op.');
      return;
    }
    setBezig(true);
    try {
      await fn();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Er ging iets mis.');
    } finally {
      setBezig(false);
    }
  };

  const voorbeeld = (locale: 'nl' | 'en') =>
    actie(async () => {
      window.open(`/api/nieuwsbrief-edities/${id}/voorbeeld?locale=${locale}`, '_blank', 'noopener');
    });

  const testmail = () =>
    actie(async () => {
      toast.success((await api('testmail')).message);
    });

  const vraagBevestiging = () =>
    actie(async () => {
      const r: Ontvangers = await api('ontvangers', 'GET');
      // De server weigert sowieso; dit voorkomt alleen een bevestigingsvenster dat toch niets doet.
      if (!r.opProductie) {
        toast.error('Versturen naar alle abonnees kan alleen op de productiesite. Hier kun je Voorbeeld en Testmail gebruiken.');
        return;
      }
      setOntvangers(r);
      openModal(MODAL);
    });

  const versturen = async () => {
    try {
      const r = await api('versturen');
      toast.success(
        r.dagen > 1
          ? `Versturen gestart: ${r.verzonden} van ${r.ontvangers} mails zijn verstuurd. De rest volgt de komende ${r.dagen - 1} dag(en), elke ochtend een deel.`
          : `Versturen gestart: ${r.verzonden} van ${r.ontvangers} mails zijn verstuurd.${r.verzonden < r.ontvangers ? ' De rest volgt morgenochtend.' : ''}`,
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Versturen mislukt.');
    }
  };

  const stoppen = () =>
    actie(async () => {
      await api('stoppen');
      toast.success('Gestopt: wie de nieuwsbrief nog niet had, krijgt hem niet meer.');
      router.refresh();
    });

  return (
    <>
      <Button onClick={() => voorbeeld('nl')} disabled={bezig} buttonStyle="secondary" size="small">
        Voorbeeld NL
      </Button>
      <Button onClick={() => voorbeeld('en')} disabled={bezig} buttonStyle="secondary" size="small">
        Voorbeeld EN
      </Button>
      <Button onClick={testmail} disabled={bezig} buttonStyle="secondary" size="small">
        {user?.email ? `Testmail naar ${user.email}` : 'Testmail'}
      </Button>
      {status === 'concept' ? (
        <Button
          onClick={vraagBevestiging}
          disabled={bezig}
          buttonStyle="primary"
          size="small"
          tooltip={omgeving && omgeving !== 'productie' ? 'Alleen op de productiesite' : undefined}
        >
          Versturen…
        </Button>
      ) : null}
      {status === 'verzenden' ? (
        <Button onClick={stoppen} disabled={bezig} buttonStyle="secondary" size="small">
          Stoppen
        </Button>
      ) : null}
      <ConfirmationModal
        modalSlug={MODAL}
        heading="Nieuwsbrief versturen?"
        confirmLabel="Versturen"
        confirmingLabel="Bezig met versturen…"
        cancelLabel="Annuleren"
        onConfirm={versturen}
        body={
          ontvangers ? (
            <>
              <p>
                Naar {ontvangers.totaal} abonnees ({ontvangers.nl} Nederlands, {ontvangers.en} Engels).
                {ontvangers.dagen > 1 ? ` Door de daglimiet duurt dit ongeveer ${ontvangers.dagen} dagen.` : ''} Daarna kun je de
                editie niet meer wijzigen.
              </p>
              {ontvangers.engelsLeeg && ontvangers.en > 0 ? (
                <p>
                  <strong>Let op:</strong> de Engelse versie is leeg. Engelstalige abonnees krijgen de Nederlandse tekst.
                </p>
              ) : null}
            </>
          ) : null
        }
      />
    </>
  );
}
