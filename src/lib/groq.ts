export async function transcribeWithGroq(audioFile: File) {
  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("engine", "groq");

  const res = await fetch("/api/transcribe", { method: "POST", body: formData });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
