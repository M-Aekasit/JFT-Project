import MesShell from '@/components/MesShell';
import { getLineBySlug, sectionList } from '@/data/lines';
import { notFound } from 'next/navigation';

export default function SectionPage({ params }) {
  const line = getLineBySlug(params.line);
  const section = sectionList.find((item) => item.slug === params.section);

  if (!line || !section) {
    notFound();
  }

  return <MesShell line={line} activeSection={section.slug} />;
}
