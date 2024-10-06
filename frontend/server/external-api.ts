"use server";

export default async function getChatResponse(
  url: string,
  model: string,
  temperature: number,
  prompt: string
) {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": url,
    },
    body: JSON.stringify({ model, temperature, prompt }),
    cache: "no-cache",
  })
    .then((res) => res.json())
    .catch((error) => console.error("Error:", error));
}
