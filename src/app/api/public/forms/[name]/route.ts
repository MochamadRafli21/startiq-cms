import { db } from "@/db/client";
import { forms } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  const allowedNamePattern = /^[a-zA-Z0-9_-]+$/;

  if (!allowedNamePattern.test(name)) {
    return new Response("Invalid form name", { status: 400 });
  }

  const data: Record<string, string> = {};
  const formData = await req.formData();

  if (formData.keys.length > 50) {
    return new Response("Too much data", { status: 413 });
  }

  formData.forEach((value, key) => {
    data[key] = value.toString();
  });

  await db
    .insert(forms)
    .values({
      name,
      data,
    })
    .returning();

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Form Submitted</title>
      <style>
        body {
          font-family: sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background-color: #f9f9f9;
        }
        h1 {
          color: #1a1a1a;
        }
        button {
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #4f46e5;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          background-color: #4338ca;
        }
      </style>
    </head>
    <body>
      <h1>Thank you! Your form was submitted successfully.</h1>
      <button onclick="history.back()">Go Back</button>
    </body>
    </html>
  `;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
}
