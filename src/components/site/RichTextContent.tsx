import type { ComponentProps, ReactElement } from 'react';
import { RichText } from '@payloadcms/richtext-lexical/react';

type RichTextContentProps = {
  data: ComponentProps<typeof RichText>['data'];
  className?: string;
};

// De renderer zet zelf één wrapper-div om alle blokken; de spatiëring moet dus
// op die wrapper (via className), niet op een ouder. Preflight haalt de
// lijststijl weg, die zetten we hier terug.
const baseClassName =
  'space-y-4 text-text [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 ' +
  '[&_h2]:pt-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:pt-2 [&_h3]:text-lg [&_h3]:font-semibold [&_img]:h-auto [&_img]:w-full [&_img]:rounded';

export function RichTextContent({ data, className }: RichTextContentProps): ReactElement {
  return <RichText data={data} className={className ? `${baseClassName} ${className}` : baseClassName} />;
}
