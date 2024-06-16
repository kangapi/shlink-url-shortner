import { ActionPanel, Action, Color, List, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fetchUrls, deleteUrl, Url, getApiConfig } from "./apiService";
import QrCodeDetail from "./qrCodeDetail";

export default function Command() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const loadUrls = async () => {
      try {
        const urlsData = await fetchUrls();
        setUrls(urlsData);
      } catch (error) {
        console.error("Error fetching URLs:", error);
      }
    };
    loadUrls();
  }, []);

  const handleDeleteUrl = async (shortCode: string) => {
    try {
      await deleteUrl(shortCode);
      setUrls((prevUrls) => prevUrls.filter((url) => url.shortCode !== shortCode));
    } catch (error) {
      console.error("Error deleting URL:", error);
    }
  };

  const filteredUrls = urls.filter((url) => {
    if (filter === "all") return true;
    if (filter === "with-tags") return url.tags.length > 0;
    if (filter === "without-tags") return url.tags.length === 0;
    return true;
  });

  return (
    <List
      isLoading={urls.length === 0}
      searchBarAccessory={
        <List.Dropdown
          id="filter"
          onChange={setFilter}
          tooltip={"Test"}>
          <List.Dropdown.Item title="All" value="all" />
          <List.Dropdown.Item title="With Tags" value="with-tags" />
          <List.Dropdown.Item title="Without Tags" value="without-tags" />
        </List.Dropdown>
      }
    >
      <List.Section title="Shortened URLs" subtitle={`${filteredUrls.length}`}>
        {filteredUrls.map((url) => (
          <List.Item
            key={url.shortUrl}
            title={"/" + url.shortCode}
            subtitle={url.longUrl}
            accessories={[
              {
                date: new Date(url.dateCreated),
                tooltip: `${formatDistanceToNow(new Date(url.dateCreated))} ago`,
              },
              {
                tag: { value: `${url.visitsCount}`, color: Color.SecondaryText },
                tooltip: "Number of visits",
              },
              ...url.tags.map((tag) => ({
                tag: { value: tag, color: Color.PrimaryText },
                tooltip: "Tag",
              })),
            ]}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content={url.shortUrl} title="Copy Short URL" />
                <Action.OpenInBrowser url={url.longUrl} title="Open Long URL" />
                <Action.Push
                  title="Show QR Code"
                  icon={Icon.BarCode}
                  target={<QrCodeDetail shortUrl={url.shortCode} apiURL={getApiConfig().apiUrl} />}
                />
                <Action
                  title="Delete URL"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["shift"], key: "delete" }}
                  onAction={() => handleDeleteUrl(url.shortCode)}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
