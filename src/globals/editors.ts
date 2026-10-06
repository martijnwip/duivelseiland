import {
  AlignFeature,
  BlockquoteFeature,
  BoldFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical';

// Alleen links naar een eigen URL: de renderer kent geen `internalDocToHref`,
// dus een interne link zou als `#` op de site komen. `enabledCollections: []`
// haalt die keuze uit het link-venster.
const customLinkFeature = () => LinkFeature({ enabledCollections: [] });

/** Korte tekst met alinea's, vet/cursief, links en lijsten (intro op de homepage). */
export const introEditor = lexicalEditor({
  features: [
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    customLinkFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    InlineToolbarFeature(),
  ],
});

/** Voettekst: alinea's, vet/cursief en links (bijv. "website by <link>"). */
export const footerEditor = lexicalEditor({
  features: [ParagraphFeature(), BoldFeature(), ItalicFeature(), customLinkFeature(), InlineToolbarFeature()],
});

/**
 * Tekst voor een nieuwsbriefmail (intro van een editie): alleen wat in mailprogramma's goed overkomt en
 * waarvoor src/lib/nieuwsbrief/editieMail.ts opmaak heeft. Geen relatieblok (geen HTML-omzetting), geen
 * checklist, code of sub/superscript; koppen H2–H4.
 */
export const mailEditor = lexicalEditor({
  features: [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    customLinkFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    IndentFeature(),
    AlignFeature(),
    BlockquoteFeature(),
    HorizontalRuleFeature(),
    UploadFeature(),
    InlineToolbarFeature(),
  ],
});
