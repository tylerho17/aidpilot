import { StatusPanel } from "@/components/ui";

type FafsaSyncBannerProps = {
  message: string;
};

export function FafsaSyncBanner({ message }: FafsaSyncBannerProps) {
  return (
    <StatusPanel tone="amber" icon="shield-check" style={{ marginBottom: 18 }}>
      {message}
    </StatusPanel>
  );
}
