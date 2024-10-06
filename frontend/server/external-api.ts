"use server";

export default async function getAssistantResponse(
  url: string,
  model: string,
  temperature: number,
  prompt: string
) {
  console.log("url is ", url);
  console.log("model is ", model);
  console.log("temperature is ", temperature);
  console.log("prompt is ", prompt);

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": url,
    },
    body: JSON.stringify({ model, temperature, prompt }),
    cache: "no-cache",
  })
    .then((res) => {
      console.log("response is ", res.status);
      res.json();
  })
    .catch((error) => console.error("Error:", error));
}
