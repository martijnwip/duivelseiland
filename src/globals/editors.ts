import {
  BoldFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
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
