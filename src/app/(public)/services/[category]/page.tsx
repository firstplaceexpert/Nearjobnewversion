import { notFound } from "next/navigation";
import { ServiceCategoryDetail } from "@/components/services/service-category-detail";
import { getServiceCategoryConfig, SERVICE_CATEGORIES } from "@/lib/service-categories";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return Object.keys(SERVICE_CATEGORIES).map((category) => ({
    category,
  }));
}

interface ServicePageProps {
  params: Promise<{ category: string }>;
}

export default async function ServiceCategoryPage({ params }: ServicePageProps) {
  const { category } = await params;
  const config = getServiceCategoryConfig(category);

  if (!config) {
    notFound();
  }

  return <ServiceCategoryDetail config={config} />;
}
