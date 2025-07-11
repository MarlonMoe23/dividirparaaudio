import { useState } from "react";
import mammoth from "mammoth";

export default function Home() {
  const [text, setText] = useState("");
  const [parts, setParts] = useState([]);
  const [copiedParts, setCopiedParts] = useState(new Set());

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target.result);
      };
      reader.readAsText(file);
    } else if (file.name.endsWith(".docx")) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const result = await mammoth.extractRawText({ arrayBuffer });
          setText(result.value);
        } catch (error) {
          alert("Error al leer el archivo Word.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Formato no soportado. Usa .txt o .docx");
    }
  };

  const splitText = () => {
    if (!text.trim()) return;
    const textContent = text.trim();
    const chunkSize = 4000; // 4000 caracteres
    const overlap = 20; // 20 caracteres
    const chunks = [];

    for (let i = 0; i < textContent.length; i += chunkSize - overlap) {
      const part = textContent.slice(i, i + chunkSize);
      chunks.push(part);
    }

    setParts(chunks);
    setCopiedParts(new Set()); // Reset copied parts when splitting new text
  };

  const downloadPart = (content, index) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parte_${index + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedParts(prev => new Set([...prev, index]));
      alert("Texto copiado al portapapeles.");
    } catch (err) {
      alert("Error al copiar el texto.");
    }
  };

  return (
    <main style={{ 
      padding: 30, 
      fontFamily: "Arial, sans-serif", 
      maxWidth: 1200, 
      margin: "0 auto",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ 
          fontSize: 32, 
          marginBottom: 30,
          color: "#2c3e50",
          textAlign: "center",
          fontWeight: "600"
        }}>
          Dividir texto en partes
        </h1>

        <div style={{ marginBottom: 25 }}>
          <label style={{ 
            display: "block", 
            marginBottom: 10, 
            fontSize: 16, 
            fontWeight: "500",
            color: "#34495e"
          }}>
            Texto a dividir:
          </label>
          <textarea
            placeholder="Pega tu texto aquí o sube un archivo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ 
              width: "100%", 
              height: 300, 
              padding: 15, 
              fontSize: 14,
              border: "2px solid #e9ecef",
              borderRadius: 8,
              resize: "vertical",
              fontFamily: "inherit",
              color: "#2c3e50",
              backgroundColor: "#ffffff"
            }}
          />
        </div>

        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: 25,
          padding: 15,
          backgroundColor: "#f1f3f4",
          borderRadius: 8
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: 16, 
            fontWeight: "500",
            color: "#2c3e50"
          }}>
            Caracteres: <span style={{ color: "#27ae60" }}>
              {text.trim().length}
            </span>
          </p>
          
          <div>
            <input 
              type="file" 
              accept=".txt,.docx" 
              onChange={handleFileUpload}
              style={{
                padding: 8,
                border: "1px solid #bdc3c7",
                borderRadius: 6,
                backgroundColor: "#ffffff"
              }}
            />
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <button
            onClick={splitText}
            style={{
              padding: "15px 30px",
              background: "#3498db",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "500",
              transition: "background-color 0.3s"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#2980b9"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#3498db"}
          >
            Dividir texto en partes
          </button>
        </div>

        {parts.length > 0 && (
          <div style={{
            backgroundColor: "#f8f9fa",
            padding: 25,
            borderRadius: 8,
            border: "1px solid #e9ecef"
          }}>
            <h2 style={{ 
              fontSize: 24, 
              marginBottom: 20,
              color: "#2c3e50",
              textAlign: "center"
            }}>
              Partes generadas: {parts.length} | Copiadas: {copiedParts.size}
            </h2>
            
            <div style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 15
            }}>
              {parts.map((part, index) => (
                <div key={index} style={{
                  padding: 20,
                  backgroundColor: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #e9ecef",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    marginBottom: 15 
                  }}>
                    <input
                      type="checkbox"
                      checked={copiedParts.has(index)}
                      readOnly
                      style={{
                        marginRight: 10,
                        transform: "scale(1.2)",
                        accentColor: "#3498db"
                      }}
                    />
                    <h3 style={{
                      margin: 0,
                      fontSize: 18,
                      color: "#2c3e50"
                    }}>
                      Parte {index + 1}
                    </h3>
                  </div>
                  
                  <p style={{
                    margin: "0 0 15px 0",
                    fontSize: 14,
                    color: "#7f8c8d"
                  }}>
                    {part.length} caracteres
                  </p>
                  
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => downloadPart(part, index)}
                      style={{
                        flex: 1,
                        padding: "10px 15px",
                        background: "#27ae60",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: "500"
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = "#229954"}
                      onMouseOut={(e) => e.target.style.backgroundColor = "#27ae60"}
                    >
                      Descargar
                    </button>

                    <button
                      onClick={() => copyToClipboard(part, index)}
                      style={{
                        flex: 1,
                        padding: "10px 15px",
                        background: "#2980b9",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: "500"
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = "#1f618d"}
                      onMouseOut={(e) => e.target.style.backgroundColor = "#2980b9"}
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}