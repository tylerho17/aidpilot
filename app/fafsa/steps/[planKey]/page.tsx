import { notFound } from "next/navigation";
import FafsaStepPage from "@/components/fafsa/FafsaStepPage";
import { getFafsaStep } from "@/lib/fafsa/steps";

type PageProps = {
  params: Promise<{ planKey: string }>;
};

export default async function FafsaGuidedStepRoute({ params }: PageProps) {
  const { planKey } = await params;
  const step = getFafsaStep(planKey);

  if (!step) {
    notFound();
  }

  return <FafsaStepPage step={step} />;
}
