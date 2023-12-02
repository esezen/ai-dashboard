import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
  const data = await req.json();
  const messages = data?.messages;

  if (messages) {
    const openAiResponse = await openai.chat.completions.create({
      messages,
      // model: "gpt-4-1106-preview",
      model: "gpt-3.5-turbo-1106",
    });
    const newMessage = openAiResponse.choices[0].message;

    return Response.json({ newMessage });
  }

  return Response.json({ newMessage: null });
}
