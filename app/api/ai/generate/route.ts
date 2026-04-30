// app/api/ai/generate/route.ts
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || prompt.trim().length < 10) {
      return Response.json({ success: false, error: "Prompt muito curto" }, { status: 400 });
    }

    // Resposta simulada para não depender da Groq agora
    const simulatedData = {
      name: "Site Gerado",
      files: {
        "index.html": `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mercado Internacional De Vendas</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-yellow-100">
  <h1 class="text-4xl font-bold text-center py-20">Mercado Internacional De Vendas</h1>
  <p class="text-center">Site gerado com sucesso!</p>
</body>
</html>`,
        "style.css": "/* CSS gerado */",
        "script.js": "console.log('Site carregado');",
        "README.md": "# Site Gerado\n\nAbra o index.html"
      }
    };

    return Response.json({ success: true, data: simulatedData });

  } catch (error) {
    console.error(error);
    return Response.json({ 
      success: false, 
      error: "Erro interno. Tente novamente." 
    }, { status: 500 });
  }
}