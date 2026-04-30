// app/criar/page.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Loader2, Download, Eye, AlertCircle, Plus, X } from "lucide-react";
import Link from "next/link";
import JSZip from "jszip";

export default function CriarPage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [siteData, setSiteData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clique no botão +
  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  // Upload de arquivos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Detecta quando o usuário digita "/"
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart;

    setPrompt(value);
    setCursorPos(position);

    // Mostra sugestões se o último caractere for "/"
    if (value[position - 1] === "/" && attachedFiles.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Insere referência do arquivo no prompt
  const insertFile = (file: File) => {
    const before = prompt.substring(0, cursorPos);
    const after = prompt.substring(cursorPos);
    const reference = ` [${file.name}] `;

    const newPrompt = before + reference + after;
    setPrompt(newPrompt);
    setShowSuggestions(false);

    // Reposiciona o cursor
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = before.length + reference.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 10);
  };

  const gerarSite = async () => {
    if (!prompt.trim()) {
      setError("Descreva o site que você deseja.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let finalPrompt = prompt;

      if (attachedFiles.length > 0) {
        finalPrompt += `\n\nArquivos anexados:\n`;
        attachedFiles.forEach((file) => {
          finalPrompt += `- ${file.name}\n`;
        });
      }

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setSiteData(data.data);
        setShowPreview(true);
      } else {
        setError(data.error || "Erro ao gerar o site");
      }
    } catch (err) {
      console.error(err);
      setError("Erro de conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const baixarSite = async () => {
    if (!siteData?.files) return;

    const zip = new JSZip();
    const slug = (siteData.name || "meu-site")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    const folder = zip.folder(slug);

    Object.entries(siteData.files).forEach(([filename, content]) => {
      folder?.file(filename, content as string);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.zip`;
    a.click();
    URL.revokeObjectURL(url);

    alert(`✅ Download concluído!\nPasta: ${slug}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </Link>
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-bold">CriaSite<span className="text-violet-400">IA</span></h1>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Crie seu site com IA</h1>
          <p className="text-zinc-400">Clique no "+" para anexar arquivos e digite "/" para referenciá-los</p>
        </div>

        <Card className="bg-zinc-900 border-zinc-700">
          <CardHeader>
            <CardTitle>Descreva o site que deseja</CardTitle>
            <CardDescription>Use / para referenciar os arquivos anexados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptChange}
                placeholder="Ex: Crie um site de moda feminina chamado India Fashion Bahia..."
                className="min-h-[220px] text-lg bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-500 pr-14"
              />

              {/* Botão + */}
              <button
                onClick={handlePlusClick}
                className="absolute bottom-4 right-4 bg-violet-600 hover:bg-violet-700 w-11 h-11 rounded-full flex items-center justify-center transition-all"
                title="Anexar arquivos"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Arquivos anexados */}
            {attachedFiles.length > 0 && (
              <div className="bg-zinc-800 p-4 rounded-xl">
                <p className="text-sm text-zinc-400 mb-3">Arquivos anexados ({attachedFiles.length})</p>
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file, i) => (
                    <div key={i} className="bg-zinc-700 text-sm px-4 py-2 rounded-full flex items-center gap-2">
                      {file.name}
                      <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-500 ml-1">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sugestões ao digitar / */}
            {showSuggestions && attachedFiles.length > 0 && (
              <div className="bg-zinc-800 border border-zinc-600 rounded-xl p-2 shadow-2xl absolute z-50 w-96 mt-1">
                <p className="text-xs text-zinc-400 px-3 py-2">Selecione um arquivo para inserir:</p>
                {attachedFiles.map((file, i) => (
                  <button
                    key={i}
                    onClick={() => insertFile(file)}
                    className="w-full text-left px-4 py-3 hover:bg-zinc-700 rounded-lg flex items-center gap-3 text-sm"
                  >
                    📎 {file.name}
                  </button>
                ))}
              </div>
            )}

            <Button 
              onClick={gerarSite} 
              disabled={isLoading || !prompt.trim()}
              className="w-full h-14 text-lg"
            >
              {isLoading ? (
                <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> A IA está criando o site...</>
              ) : (
                "✨ Gerar Site com IA"
              )}
            </Button>
          </CardContent>
        </Card>

        {error && <p className="text-red-400 mt-6 text-center">{error}</p>}

        {siteData && (
          <div className="mt-10 space-y-6">
            <div className="flex gap-4">
              <Button onClick={() => setShowPreview(!showPreview)} variant="outline" className="flex-1 h-14">
                <Eye className="mr-2" /> {showPreview ? "Fechar Preview" : "Ver Preview"}
              </Button>
              <Button onClick={baixarSite} className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700">
                <Download className="mr-2" /> Baixar Site
              </Button>
            </div>

            {showPreview && siteData.files?.["index.html"] && (
              <Card className="bg-white border-zinc-700 overflow-hidden">
                <iframe 
                  srcDoc={siteData.files["index.html"]} 
                  className="w-full h-[820px] border-0"
                />
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}