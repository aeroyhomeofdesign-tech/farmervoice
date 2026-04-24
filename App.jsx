import { useState, useRef } from "react";

const GEMINI_MODEL = "claude-sonnet-4-20250514";

const translations = {
  en: {
    title: "FarmerVoice",
    tagline: "Your market. Your language.",
    placeholder: "Ask about your crop price, buyers, or when to sell...",
    ask: "Ask",
    loading: "Getting your answer...",
    lang: "Language",
    apiPlaceholder: "Paste your Gemini API key here",
    apiLabel: "Gemini API Key",
    save: "Save",
    examples: ["What is the price of maize today?", "Who is buying tomatoes in Harare?", "When should I sell my tobacco?"],
  },
  sn: {
    title: "FarmerVoice",
    tagline: "Musika wako. Mutauro wako.",
    placeholder: "Bvunza nezve mutengo wezvirimwa zvako, vatengi, kana nguva yokutengesera...",
    ask: "Bvunza",
    loading: "Tichitsvaga mhinduro yako...",
    lang: "Mutauro",
    apiPlaceholder: "Isa Gemini API key yako pano",
    apiLabel: "Gemini API Key",
    save: "Sevha",
    examples: ["Mutengo wemupunga nhasi ndeyi?", "Ndiani anotengesa tamati muHarare?", "Ndingatengeserei fodya rini?"],
  },
  nd: {
    title: "FarmerVoice",
    tagline: "Imakethe yakho. Ulimi lwakho.",
    placeholder: "Buza ngentengo yezitshalo zakho, abathenga, noma nini ukuthengisa...",
    ask: "Buza",
    loading: "Sithola impendulo yakho...",
    lang: "Ulimi",
    apiLabel: "Gemini API Key",
    apiPlaceholder: "Faka i-Gemini API key yakho lapha",
    save: "Gcina",
    examples: ["Intengo yommbila lamuhla iyini?", "Ngubani othengisa amathomato eHarare?", "Ngizokhathini ngithengise ugwayi wami?"],
  },
};

const SYSTEM_PROMPT = `You are FarmerVoice, an AI assistant helping Zimbabwean farmers get real-time commodity market intelligence. 

Your job is to respond in the SAME LANGUAGE the farmer uses. If they write in Shona, respond in Shona. If Ndebele, respond in Ndebele. If English, respond in English.

Always structure your response in this format (translated to the appropriate language):
1. 💰 PRICE: Current approximate price range for the crop (use USD/kg or USD/tonne as Zimbabwe farmers use USD)
2. 🛒 BUYERS: Who is buying and where (mention known buyers like GMB, Grain Lobbyists, local markets in Harare/Bulawayo/Mutare)
3. 📅 BEST TIME TO SELL: Advice on timing for maximum profit
4. ⚠️ TIP: One quick market tip

Keep answers concise, practical, and grounded in Zimbabwean agricultural market context. Reference real locations, real buyers (GMB, Grain Millers, etc), and realistic USD prices.`;

export default function FarmerVoice() {
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("fv_key") || "");
const [apiSaved, setApiSaved] = useState(() => !!localStorage.getItem("fv_key"));
const [tempKey, setTempKey] = useState(() => localStorage.getItem("fv_key") || "");
  const [tempKey, setTempKey] = useState("");
  const [error, setError] = useState(null);
  const t = translations[lang];

const saveKey = () => {
  setApiKey(tempKey);
  setApiSaved(true);
  localStorage.setItem("fv_key", tempKey);
};

  const ask = async (q) => {
    const question = q || query;
    if (!question.trim() || !apiKey) return;
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: question }],
        }),
      });

      // Actually use Gemini API
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ parts: [{ text: question }] }],
          }),
        }
      );

      const data = await geminiRes.json();
      if (data.error) {
        setError(data.error.message || "API error. Check your key.");
      } else {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        setResponse(text || "No response received.");
      }
    } catch (e) {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("💰") || line.startsWith("🛒") || line.startsWith("📅") || line.startsWith("⚠️")) {
        return (
          <div key={i} style={{ marginBottom: "12px" }}>
            <span style={{ fontWeight: 700, color: "#2d6a4f", fontSize: "15px" }}>{line}</span>
          </div>
        );
      }
      return line.trim() ? <p key={i} style={{ margin: "4px 0", color: "#374151", fontSize: "14px", lineHeight: 1.6 }}>{line}</p> : null;
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0a2a1a 0%, #1a3a2a 40%, #0d1f12 100%)",
      fontFamily: "'Georgia', serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Grain texture overlay */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.04,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Decorative circles */}
      <div style={{ position: "fixed", top: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(74,185,100,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-100px", left: "-60px", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,160,23,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "480px", margin: "0 auto", padding: "24px 16px 100px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", paddingBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "32px" }}>🌾</span>
            <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "#ffffff", letterSpacing: "-1px" }}>
              Farmer<span style={{ color: "#4ab964" }}>Voice</span>
            </h1>
          </div>
          <p style={{ margin: 0, color: "#a7c4a0", fontSize: "14px", fontStyle: "italic" }}>{t.tagline}</p>

          {/* Language selector */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
            {[["en", "English"], ["sn", "Shona"], ["nd", "Ndebele"]].map(([code, label]) => (
              <button key={code} onClick={() => setLang(code)} style={{
                padding: "6px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600, transition: "all 0.2s",
                background: lang === code ? "#4ab964" : "rgba(255,255,255,0.08)",
                color: lang === code ? "#0a2a1a" : "#a7c4a0",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* API Key Setup */}
        {!apiSaved && (
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,160,23,0.3)", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
            <p style={{ margin: "0 0 12px", color: "#d4a017", fontSize: "13px", fontWeight: 700 }}>🔑 {t.apiLabel}</p>
            <input
              type="password"
              placeholder={t.apiPlaceholder}
              value={tempKey}
              onChange={e => setTempKey(e.target.value)}
              style={{
                width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: "13px", boxSizing: "border-box", outline: "none",
              }}
            />
            <button onClick={saveKey} disabled={!tempKey} style={{
              marginTop: "10px", width: "100%", padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: tempKey ? "#4ab964" : "rgba(255,255,255,0.1)", color: tempKey ? "#0a2a1a" : "#666", fontWeight: 700, fontSize: "14px",
            }}>{t.save}</button>
          </div>
        )}

        {apiSaved && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <span style={{ color: "#4ab964", fontSize: "13px" }}>✓ API Key saved</span>
            <button onClick={() => { setApiSaved(false); setTempKey(apiKey); }} style={{ background: "none", border: "none", color: "#a7c4a0", fontSize: "11px", cursor: "pointer", textDecoration: "underline" }}>change</button>
          </div>
        )}

        {/* Quick examples */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "0 0 10px", color: "#a7c4a0", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Quick questions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {t.examples.map((ex, i) => (
              <button key={i} onClick={() => { setQuery(ex); ask(ex); }} style={{
                textAlign: "left", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(74,185,100,0.2)",
                background: "rgba(74,185,100,0.05)", color: "#c8e6c0", fontSize: "13px", cursor: "pointer",
                transition: "all 0.2s", fontFamily: "Georgia, serif",
              }}>{ex}</button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div style={{ position: "relative", marginBottom: "20px" }}>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t.placeholder}
            rows={3}
            style={{
              width: "100%", padding: "16px", paddingRight: "70px", borderRadius: "16px",
              border: "1px solid rgba(74,185,100,0.3)", background: "rgba(255,255,255,0.05)",
              color: "#fff", fontSize: "15px", resize: "none", outline: "none", boxSizing: "border-box",
              fontFamily: "Georgia, serif", lineHeight: 1.5,
            }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
          />
          <button onClick={() => ask()} disabled={loading || !query.trim() || !apiKey} style={{
            position: "absolute", right: "12px", bottom: "12px",
            padding: "10px 16px", borderRadius: "10px", border: "none", cursor: "pointer",
            background: query.trim() && apiKey ? "#4ab964" : "rgba(255,255,255,0.1)",
            color: query.trim() && apiKey ? "#0a2a1a" : "#666", fontWeight: 700, fontSize: "13px",
            transition: "all 0.2s",
          }}>{t.ask}</button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "32px" }}>
            <div style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid rgba(74,185,100,0.2)", borderTopColor: "#4ab964", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "#a7c4a0", marginTop: "12px", fontSize: "14px" }}>{t.loading}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
            <p style={{ margin: 0, color: "#fca5a5", fontSize: "13px" }}>⚠️ {error}</p>
          </div>
        )}

        {/* Response */}
        {response && !loading && (
          <div style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(74,185,100,0.25)",
            borderRadius: "16px", padding: "20px", animation: "fadeIn 0.4s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: "18px" }}>🌾</span>
              <span style={{ color: "#4ab964", fontWeight: 700, fontSize: "14px" }}>FarmerVoice</span>
            </div>
            <div>{formatResponse(response)}</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        * { -webkit-tap-highlight-color: transparent; }
        textarea::placeholder { color: rgba(167, 196, 160, 0.5); }
        input::placeholder { color: rgba(167, 196, 160, 0.4); }
        button:active { transform: scale(0.97); }
      `}</style>
    </div>
  );
         }
