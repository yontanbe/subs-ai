export async function generateImage(prompt: string): Promise<string> {
  const res = await fetch("/api/keywords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keywords: [prompt], source: "nano-banana" }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.items[0]?.url ?? "";
}
