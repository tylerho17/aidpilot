import FafsaStepPage from "@/components/fafsa/FafsaStepPage";
import FafsaStepClient from "@/components/product/FafsaStepClient";
import { getFafsaStep } from "@/lib/fafsa/steps";

type PageProps = {
  params: Promise<{ planKey: string }>;
};

export default async function FafsaGuidedStepRoute({ params }: PageProps) {
  const { planKey } = await params;
  const step = getFafsaStep(planKey);

  return step ? <FafsaStepPage step={step} /> : <FafsaStepClient />;
}
