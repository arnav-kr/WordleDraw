// proxy to nytimes api
export default async function handler(request, response) {
  try {
    const { searchParams } = new URL(request.url);
    const date = (new Date(searchParams.get('date')) || new Date()).toISOString().split("T")[0];
    const res = await fetch(`https://www.nytimes.com/svc/wordle/v2/${date}.json`, {
      method: "GET",
      headers: {
        origin: "https://www.nytimes.com"
      }
    })
    const data = await res.json();
    response.status(200).json({ success: true, ...data });

  } catch (error) {
    console.error("Serverless Function Error:", error);
    response.status(500).json({ success: false, error: "Internal Server Error" });
  }
}