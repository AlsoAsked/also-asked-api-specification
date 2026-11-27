// Adds a link to the Markdown version of each guide page (from plugins/llm-outputs.ts) to the page
// head. The API reference pages use this component too, but they have no Markdown version.
import Head from '@docusaurus/Head';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import type { WrapperProps } from '@docusaurus/types';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useRouteContext from '@docusaurus/useRouteContext';
import type MetadataType from '@theme/DocItem/Metadata';
import Metadata from '@theme-original/DocItem/Metadata';
import type { ReactNode } from 'react';

type MetadataWrapperProperties = WrapperProps<typeof MetadataType>;

// The ID of the docs plugin instance that publishes the guide pages.
const GUIDES_PLUGIN_ID = 'default';

function MarkdownAlternate(): ReactNode {
  const { metadata } = useDoc();
  const href = useBaseUrl(`${metadata.permalink}.md`, { absolute: true });
  return (
    <Head>
      <link rel="alternate" type="text/markdown" href={href} />
    </Head>
  );
}

export default function MetadataWrapper(properties: MetadataWrapperProperties): ReactNode {
  const { plugin } = useRouteContext();
  return (
    <>
      <Metadata {...properties} />
      {plugin.id === GUIDES_PLUGIN_ID && <MarkdownAlternate />}
    </>
  );
}
