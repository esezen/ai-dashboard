import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
  const data = await req.json();
  const { messages, model } = data;

  if (messages) {
    const openAiResponse = await openai.chat.completions.create({
      messages,
      model,
    });
    const newMessage = openAiResponse.choices[0].message;

    return Response.json({ newMessage });
  }

  return Response.json({ newMessage: null });
}
