// app/api/ai/generate/route.ts
import { NextRequest } from "next/server";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || prompt.trim().length < 30) {
      return Response.json({ 
        success: false, 
        error: "Descreva seu site com bastante detalhe (mínimo 30 caracteres)." 
      }, { status: 400 });
    }

    const systemPrompt = `Você é um **Senior UI/UX Designer + Frontend Developer** especializado em criar sites premium, modernos e altamente conversivos para empresas brasileiras.

Sua missão é gerar sites **ricos, complexos e visualmente impressionantes**. Nunca gere sites simples ou minimalistas demais.

Regras obrigatórias:
- Sempre inclua Navbar profissional com logo
- Hero section impactante com call-to-action forte
- Pelo menos 6-8 seções bem definidas
- Design moderno com bom espaçamento, sombras sutis e hierarquia visual
- Inclua botão flutuante de WhatsApp
- Totalmente responsivo

Responda **EXCLUSIVAMENTE** com um JSON válido, sem qualquer texto antes ou depois.

Estrutura exata:

{
  "name": "Nome da Empresa",
  "description": "Descrição curta e atrativa",
  "colorPalette": {
    "primary": "#hex principal",
    "secondary": "#hex",
    "accent": "#hex destaque",
    "background": "#f8fafc ou #0f172a",
    "text": "#111827 ou #f1f5f9"
  },
  "style": "modern",
  "pages": [
    {
      "title": "Início",
      "slug": "home",
      "sections": [
        {
          "type": "navbar",
          "content": {
            "logoText": "Nome da Empresa",
            "menuItems": ["Início", "Sobre", "Serviços", "Galeria", "Contato"]
          }
        },
        {
          "type": "hero",
          "content": {
            "title": "Título grande e impactante",
            "subtitle": "Subtítulo persuasivo",
            "buttonText": "Falar no WhatsApp",
            "buttonLink": "https://wa.me/5511999999999"
          }
        },
        {
          "type": "about",
          "content": { "title": "Sobre Nós", "description": "Texto detalhado..." }
        },
        {
          "type": "services",
          "content": {
            "title": "Nossos Serviços",
            "items": [
              { "title": "Serviço 1", "description": "Descrição curta", "icon": "sparkles" }
            ]
          }
        },
        {
          "type": "gallery",
          "content": { "title": "Galeria / Antes e Depois" }
        },
        {
          "type": "testimonials",
          "content": { "title": "O que nossos clientes dizem" }
        },
        {
          "type": "cta",
          "content": { "title": "Pronto para transformar?", "buttonText": "Agendar Agora" }
        }
      ]
    }
  ]
}`;

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"), // ou "mixtral-8x7b-32768"
      system: systemPrompt,
      prompt: `Crie um site premium, rico em detalhes e visualmente bonito para o seguinte negócio:\n\n${prompt}`,
      temperature: 0.72,
      maxTokens: 2500,
    });

    // Extrai JSON de forma mais robusta
    let jsonData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : text;
      jsonData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Parse JSON failed:", e);
      return Response.json({ 
        success: false, 
        error: "A IA não retornou JSON válido. Tente reformular sua descrição." 
      });
    }

    return Response.json({ success: true, data: jsonData });

  } catch (error: any) {
    console.error("Erro na API:", error);
    return Response.json({ 
      success: false, 
      error: "Erro interno ao gerar o site. Tente novamente." 
    }, { status: 500 });
  }
}