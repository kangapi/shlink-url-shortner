import { ActionPanel, Action, Form, showToast, Toast, useNavigation, Clipboard } from "@raycast/api";
import { useEffect, useState } from "react";
import { createShortUrl, fetchUrlByShortCode, getTags } from "./apiService";
import ManageShortUrl from "./manageShortUrl";

export default function Command() {
  const { push } = useNavigation();
  const [longUrl, setLongUrl] = useState<string>("");
  const [customSlug, setCustomSlug] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

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

  useEffect(() => {
    const loadTags = async () => {
      try {
        const fetchedTags = await getTags();
        setAvailableTags(fetchedTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    loadTags();
  }, []);

  const handleSubmit = async (values: { longUrl: string; customSlug?: string; tags: string[] }) => {
    try {
      const shortUrl = await createShortUrl(values.longUrl, values.customSlug, values.tags);
      const shortCode = shortUrl.split("/").pop(); // Extract the short code from the short URL
      await fetchUrlByShortCode(shortCode!);
      await Clipboard.copy(shortUrl);
      await showToast(Toast.Style.Success, "URL Shortened", `Short URL: ${shortUrl} (Copied to clipboard)`);
      push(<ManageShortUrl />);
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
      <Form.TagPicker id="tags" title="Tags" value={tags} onChange={setTags}>
        {availableTags.map((tag) => (
          <Form.TagPicker.Item key={tag} value={tag} title={tag} />
        ))}
      </Form.TagPicker>
    </Form>
  );
}
