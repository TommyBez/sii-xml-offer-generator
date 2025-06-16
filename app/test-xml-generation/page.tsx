"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XMLGenerationService } from "@/lib/xml-generation";
import { SIIOfferta, TipoMercato, TipoCliente, TipoOfferta, TipologiaAttContr, ModalitaPagamento, ModalitaAttivazione } from "@/types/sii-generated";

export default function TestXMLGeneration() {
  const [xmlOutput, setXmlOutput] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const createTestData = (): SIIOfferta => ({
    IdentificativiOfferta: {
      PIVA_UTENTE: "12345678901234AB",
      COD_OFFERTA: "TEST001"
    },
    DettaglioOfferta: {
      TIPO_MERCATO: TipoMercato.Elettrico,
      OFFERTA_SINGOLA: "SI",
      TIPO_CLIENTE: TipoCliente.Domestico,
      DOMESTICO_RESIDENTE: "01",
      TIPO_OFFERTA: TipoOfferta.Fisso,
      TIPOLOGIA_ATT_CONTR: [TipologiaAttContr.CambioFornitore, TipologiaAttContr.Voltura],
      NOME_OFFERTA: "Offerta Test Elettrico Casa",
      DESCRIZIONE: "Questa è un'offerta di test per verificare la generazione XML. Include caratteri speciali & < > \" '",
      DURATA: 12,
      GARANZIE: "Prezzo bloccato per 12 mesi"
    },
    "DettaglioOfferta.ModalitaAttivazione": {
      MODALITA: [ModalitaAttivazione.SoloWeb, ModalitaAttivazione.QualsiisiCanale],
      DESCRIZIONE: "Attivabile online o presso i nostri punti vendita"
    },
    "DettaglioOfferta.Contatti": {
      TELEFONO: "800123456",
      URL_SITO_VENDITORE: "https://example.com",
      URL_OFFERTA: "https://example.com/offerta-test"
    },
    ValiditaOfferta: {
      DATA_INIZIO: "01/01/2024_00:00:00",
      DATA_FINE: "31/12/2024_23:59:59"
    },
    MetodoPagamento: [
      {
        MODALITA_PAGAMENTO: ModalitaPagamento.DomiciliazioneBancaria,
        DESCRIZIONE: "Addebito SEPA"
      },
      {
        MODALITA_PAGAMENTO: ModalitaPagamento.BollettinoPrecompilato,
        DESCRIZIONE: "Bollettino postale"
      }
    ],
    RiferimentiPrezzoEnergia: {
      IDX_PREZZO_ENERGIA: "01",
      ALTRO: "PUN + 0,01 €/kWh"
    },
    CaratteristicheOfferta: {
      CONSUMO_MIN: 0,
      CONSUMO_MAX: 10000,
      POTENZA_MIN: 3.0,
      POTENZA_MAX: 15.0
    },
    ComponenteImpresa: [
      {
        NOME: "Componente energia",
        DESCRIZIONE: "Costo della materia energia",
        TIPOLOGIA: "Variabile"
      },
      {
        NOME: "Componente commercializzazione",
        DESCRIZIONE: "Costi di commercializzazione",
        TIPOLOGIA: "Fisso"
      }
    ],
    Sconto: [
      {
        NOME: "Sconto nuovo cliente",
        DESCRIZIONE: "10% di sconto per i primi 6 mesi"
      }
    ],
    ProdottiServiziAggiuntivi: [
      {
        NOME: "Assistenza premium",
        DESCRIZIONE: "Assistenza telefonica dedicata 24/7"
      }
    ],
    ZoneOfferta: {
      ZONA: ["NORD", "CENTRO", "SUD"]
    }
  });

  const generateXML = async () => {
    setLoading(true);
    setError("");
    
    try {
      const service = new XMLGenerationService();
      const testData = createTestData();
      
      const result = await service.generateXML({
        data: testData,
        fileNameParams: {
          pivaUtente: "12345678901234AB",
          azione: "INSERIMENTO",
          descrizione: "Offerta Test XML"
        },
        optimize: true,
        minify: false,
        validate: false // Skip validation for now as we don't have XSD loaded
      });

      setXmlOutput(result.xml);
      setFileName(result.fileName || "");
      setStats(result.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const downloadXML = () => {
    if (!xmlOutput) return;

    const blob = new Blob([xmlOutput], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "offerta.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!xmlOutput) return;
    navigator.clipboard.writeText(xmlOutput);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Test XML Generation</h1>
      
      <div className="grid gap-6">
        {/* Controls */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Generate Test XML</h2>
          <div className="flex gap-4">
            <Button 
              onClick={generateXML} 
              disabled={loading}
              variant="default"
            >
              {loading ? "Generating..." : "Generate XML"}
            </Button>
            
            {xmlOutput && (
              <>
                <Button 
                  onClick={downloadXML}
                  variant="outline"
                >
                  Download XML
                </Button>
                <Button 
                  onClick={copyToClipboard}
                  variant="outline"
                >
                  Copy to Clipboard
                </Button>
              </>
            )}
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              Error: {error}
            </div>
          )}
        </Card>

        {/* File Info */}
        {fileName && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">File Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="font-medium text-gray-600">File Name:</dt>
                <dd className="font-mono">{fileName}</dd>
              </div>
              {stats && (
                <>
                  <div>
                    <dt className="font-medium text-gray-600">Original Size:</dt>
                    <dd>{(stats.originalSize / 1024).toFixed(2)} KB</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-600">Minified Size:</dt>
                    <dd>{(stats.minifiedSize / 1024).toFixed(2)} KB</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-600">Element Count:</dt>
                    <dd>{stats.elementCount}</dd>
                  </div>
                </>
              )}
            </dl>
          </Card>
        )}

        {/* XML Output */}
        {xmlOutput && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Generated XML</h2>
            <div className="relative">
              <pre className="bg-gray-50 p-4 rounded overflow-x-auto max-h-[600px] overflow-y-auto">
                <code className="text-sm">{xmlOutput}</code>
              </pre>
            </div>
          </Card>
        )}

        {/* Test Data Preview */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Data Structure</h2>
          <div className="bg-gray-50 p-4 rounded overflow-x-auto max-h-[400px] overflow-y-auto">
            <pre className="text-sm">
              <code>{JSON.stringify(createTestData(), null, 2)}</code>
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
} 