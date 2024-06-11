// qrCodeDetail.tsx
import { Action, ActionPanel, Detail } from "@raycast/api";

interface QrCodeDetailProps {
  apiURL: string;
  shortUrl: string;
}

export default function QrCodeDetail({ shortUrl, apiURL }: QrCodeDetailProps) {
  const qrCodeUrl = `${apiURL}/${shortUrl}/qr-code`;

  return (
    <Detail
      markdown={`![QR Code](${qrCodeUrl})`}
      navigationTitle="QR Code"
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={qrCodeUrl} title="Open QR Code in Browser" />
        </ActionPanel>
      }
    />
  );
}
