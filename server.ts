import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "2mb" }));

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ecolar" });
});

app.post("/api/ai/engineer", async (req, res) => {
  try {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: "Chave da API Gemini não configurada no servidor. Verifique Settings > Secrets.",
      });
      return;
    }

    const { question, history, projectContext } = req.body ?? {};
    if (!question || typeof question !== "string") {
      res.status(400).json({ error: "Envie uma pergunta válida para a IA Engenheiro." });
      return;
    }

    const contextSummary = JSON.stringify(projectContext ?? {}, null, 2);
    const recentHistory = Array.isArray(history)
      ? history
          .slice(-6)
          .map((m: { role?: string; text?: string }) =>
            `${m.role === "user" ? "Usuário" : "IA Engenheiro"}: ${m.text ?? ""}`
          )
          .join("\n")
      : "";

    const systemInstruction = `Você é a IA Engenheiro do aplicativo Ecolar, um copiloto prático de construção sustentável, econômica e acessível para famílias, pequenos construtores, mestres de obra e técnicos no Brasil.
Responda sempre em português brasileiro simples, claro, direto e educativo, evitando jargão técnico excessivo.
Considere rigorosamente os dados reais desta obra (orçamento, clima, localização, etapa atual, diagnóstico, gastos e diário) fornecidos abaixo.
Estruture sua resposta em JSON seguindo exatamente o esquema definido, trazendo números realistas para a realidade brasileira em Reais (R$) quando aplicável e mantendo cada bloco objetivo e prático.`;

    const prompt = `Dados atuais da obra do usuário:
${contextSummary}

${recentHistory ? `Histórico recente da conversa:\n${recentHistory}\n` : ""}
Pergunta atual do usuário:
"${question}"`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumo: {
              type: Type.STRING,
              description: "Resposta direta em 1 a 2 frases simples.",
            },
            recomendacao: {
              type: Type.STRING,
              description: "O que fazer na prática nesta obra.",
            },
            motivo: {
              type: Type.STRING,
              description: "Por que essa escolha funciona bem para esta obra.",
            },
            impactoCusto: {
              type: Type.STRING,
              description: "Impacto financeiro estimado ou economia esperada em linguagem simples.",
            },
            impactoAmbiental: {
              type: Type.STRING,
              description: "Benefício em água, energia, CO2 ou redução de entulho.",
            },
            cuidadosTecnicos: {
              type: Type.STRING,
              description: "Cuidados essenciais na execução para não ter retrabalho.",
            },
            quandoChamarProfissional: {
              type: Type.STRING,
              description: "Quando é indispensável consultar engenheiro, arquiteto ou eletricista/encanador habilitado.",
            },
          },
          required: [
            "resumo",
            "recomendacao",
            "motivo",
            "impactoCusto",
            "impactoAmbiental",
            "cuidadosTecnicos",
            "quandoChamarProfissional",
          ],
        },
      },
    });

    const raw = (response.text ?? "{}").trim();
    const parsed = JSON.parse(raw);
    res.json({ structured: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao consultar a IA Engenheiro.";
    console.error("Erro /api/ai/engineer:", message);
    res.status(502).json({
      error: "Não foi possível obter resposta da IA Engenheiro no momento. Tente novamente em instantes.",
      detail: message,
    });
  }
});

app.post("/api/ai/diagnosis", async (req, res) => {
  try {
    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: "Chave da API Gemini não configurada no servidor. Verifique Settings > Secrets.",
      });
      return;
    }

    const { answers } = req.body ?? {};
    if (!answers || typeof answers !== "object") {
      res.status(400).json({ error: "Dados do diagnóstico inválidos." });
      return;
    }

    const systemInstruction = `Você é o motor de Diagnóstico Inteligente do Ecolar. Analise os dados da obra e gere notas de 0 a 100, estimativas realistas de custo e desperdício para o Brasil, principais riscos e uma mensagem de resumo clara e acolhedora em português simples.`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Analise esta obra e retorne o diagnóstico em JSON:\n${JSON.stringify(answers, null, 2)}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            notaSustentabilidade: { type: Type.INTEGER },
            notaEconomia: { type: Type.INTEGER },
            notaEficienciaEnergetica: { type: Type.INTEGER },
            custoEstimadoMin: { type: Type.NUMBER },
            custoEstimadoMax: { type: Type.NUMBER },
            desperdicioEstimadoPercentual: { type: Type.INTEGER },
            economiaPotencialEstimada: { type: Type.NUMBER },
            resumoDiagnostico: { type: Type.STRING },
            principaisRiscos: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  titulo: { type: Type.STRING },
                  nivel: { type: Type.STRING },
                  explicacao: { type: Type.STRING },
                },
                required: ["titulo", "nivel", "explicacao"],
              },
            },
          },
          required: [
            "notaSustentabilidade",
            "notaEconomia",
            "notaEficienciaEnergetica",
            "custoEstimadoMin",
            "custoEstimadoMax",
            "desperdicioEstimadoPercentual",
            "economiaPotencialEstimada",
            "resumoDiagnostico",
            "principaisRiscos",
          ],
        },
      },
    });

    const raw = (response.text ?? "{}").trim();
    const parsed = JSON.parse(raw);
    res.json({ diagnosis: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro ao gerar diagnóstico.";
    console.error("Erro /api/ai/diagnosis:", message);
    res.status(502).json({
      error: "Não foi possível recalcular o diagnóstico com a IA agora.",
      detail: message,
    });
  }
});

async function startServer() {
  const port = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(express.static(distDir));
    app.get("/{*path}", (_req, res) => {
      const indexPath = path.join(distDir, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Build não encontrado.");
      }
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Ecolar servidor ativo na porta ${port}`);
  });
}

startServer();
