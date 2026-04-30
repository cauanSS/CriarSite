// app/criar/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Loader2, Download, Eye } from "lucide-react";
import Link from "next/link";
import JSZip from "jszip";

export default function CriarPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [siteData, setSiteData] = useState<any>(null);

  const gerarSite = async () => {
    setIsLoading(true);
    setSiteData(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.success) {
        setSiteData(data.data);
      } else {
        alert("Erro: " + data.error);
      }
    } catch (err) {
      alert("Erro de conexão. Verifique sua internet.");
    } finally {
      setIsLoading(false);
    }
  };

  const baixarSite = async () => {
    if (!siteData) return;

    const zip = new JSZip();
    const slug = siteData.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const folder = zip.folder(slug)!;

    folder.file("index.html", generateHTML(siteData));
    folder.file("style.css", generateCSS(siteData));
    folder.file("script.js", generateJS(siteData));
    folder.file("README.md", generateREADME(siteData));

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    alert(`Download concluído! Extraia ${slug}.zip e abra o index.html`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-white/10 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </Link>
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-bold">AuraSite</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-20">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">Crie seu site com IA</h1>
          <p className="text-xl text-zinc-400">Descreva seu negócio e receba um site completo e profissional</p>
        </div>

        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-3xl">Descreva seu negócio</CardTitle>
            <CardDescription className="text-base">
              Quanto mais detalhes (nome, cidade, estilo, cores, funcionalidades), melhor o resultado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Textarea
              placeholder="Ex: Quero um site luxuoso para clínica de estética Belleza Glow em Salvador, tons de rosa, branco e dourado..."
              className="min-h-[260px] text-lg bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <Button 
              onClick={gerarSite} 
              disabled={isLoading || !prompt.trim()}
              className="w-full h-14 text-lg bg-violet-600 hover:bg-violet-700"
            >
              {isLoading ? (
                <> <Loader2 className="mr-3 animate-spin" /> Gerando site com IA... </>
              ) : (
                <> ✨ Gerar Site Completo </>
              )}
            </Button>
          </CardContent>
        </Card>

        {siteData && (
          <Card className="mt-10 bg-zinc-900 border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-emerald-400">✅ Site Gerado com Sucesso!</CardTitle>
              <p className="text-3xl font-bold mt-2">{siteData.name}</p>
            </CardHeader>
            <CardContent>
              <Button onClick={baixarSite} className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700">
                <Download className="mr-3" /> Baixar Site Completo (.zip)
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}