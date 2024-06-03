import {
  ActionPanel,
  Action,
  Form,
  showToast,
  Toast,
  useNavigation,
  Clipboard,
  getPreferenceValues
} from "@raycast/api";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Command() {

  const preferences = getPreferenceValues<Preferences>();
  const apiKey = preferences.apiKey;
  const apiUrl = preferences.apiUrl;

  const { pop } = useNavigation();
  const [longUrl, setLongUrl] = useState<string>("");
  const [customSlug, setCustomSlug] = useState<string>("");

  useEffect(() => {
    const fetchClipboard = async () => {
      try {
        const clipboardContent = await Clipboard.readText();
        if (clipboardContent && clipboardContent.startsWith("http")) {
          setLongUrl(clipboardContent);
        }
      } catch (error) {
        console.error("Error fetching clipboard content:", error);
      }
    };

    fetchClipboard();
  }, []);

  const handleSubmit = async (values: { longUrl: string; customSlug?: string }) => {
    try {
      const url = `${apiUrl}/rest/v3/short-urls`;
      const headers = {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey
      };
      const data = {
        longUrl: values.longUrl,
        customSlug: values.customSlug || undefined,
      };
      const response = await axios.post(url, data, { headers });
      const shortUrl = response.data.shortUrl;
      await Clipboard.copy(shortUrl);
      await showToast(Toast.Style.Success, "URL Shortened", `Short URL: ${shortUrl} (Copied to clipboard)`);
      pop(); // Close the form after successful submission
    } catch (error) {
      console.error("Error creating short URL:", error);
      await showToast(Toast.Style.Failure, "Error", "Failed to create the short URL");
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Shorten URL" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="longUrl"
        title="Long URL"
        placeholder="Enter the URL to shorten"
        value={longUrl}
        onChange={setLongUrl}
      />
      <Form.TextField
        id="customSlug"
        title="Custom Slug"
        placeholder="Enter a custom slug (optional)"
        value={customSlug}
        onChange={setCustomSlug}
      />
    </Form>
  );
}
