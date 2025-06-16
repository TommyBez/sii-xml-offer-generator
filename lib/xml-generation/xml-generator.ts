import { create } from "xmlbuilder2";
import { XMLBuilderOptions } from "xmlbuilder2/lib/interfaces";
import { SIIOfferta } from "@/types/sii-generated";
import { XMLFormatter } from "./xml-formatter";
import { XMLGenerationError } from "./errors";

export class XMLGenerator {
  private formatter: XMLFormatter;
  private options: XMLBuilderOptions = {
    encoding: "UTF-8",
    standalone: true,
    prettyPrint: true,
    indent: "  ",
    newline: "\n",
  };

  constructor() {
    this.formatter = new XMLFormatter();
  }

  generateOfferXML(data: SIIOfferta): string {
    try {
      const root = create({ version: "1.0", encoding: "UTF-8" }).ele("Offerta");

      // Build XML structure
      this.addIdentificativi(root, data.IdentificativiOfferta);
      this.addDettaglioOfferta(root, data.DettaglioOfferta);
      this.addModalitaAttivazione(root, data["DettaglioOfferta.ModalitaAttivazione"]);
      this.addContatti(root, data["DettaglioOfferta.Contatti"]);
      this.addValiditaOfferta(root, data.ValiditaOfferta);
      
      // Repeatable elements
      if (data.MetodoPagamento && data.MetodoPagamento.length > 0) {
        this.addMetodiPagamento(root, data.MetodoPagamento);
      }

      // Optional sections
      if (data.RiferimentiPrezzoEnergia) {
        this.addRiferimentiPrezzoEnergia(root, data.RiferimentiPrezzoEnergia);
      }

      if (data.CaratteristicheOfferta) {
        this.addCaratteristicheOfferta(root, data.CaratteristicheOfferta);
      }

      if (data.OffertaDUAL) {
        this.addOffertaDUAL(root, data.OffertaDUAL);
      }

      if (data.ComponentiRegolate) {
        this.addComponentiRegolate(root, data.ComponentiRegolate);
      }

      if (data.TipoPrezzo) {
        this.addTipoPrezzo(root, data.TipoPrezzo);
      }

      if (data.FasceOrarieSettimanale) {
        this.addFasceOrarieSettimanale(root, data.FasceOrarieSettimanale);
      }

      if (data.Dispacciamento && data.Dispacciamento.length > 0) {
        this.addDispaciamento(root, data.Dispacciamento);
      }

      if (data.ComponenteImpresa && data.ComponenteImpresa.length > 0) {
        this.addComponenteImpresa(root, data.ComponenteImpresa);
      }

      if (data.CondizioniContrattuali && data.CondizioniContrattuali.length > 0) {
        this.addCondizioniContrattuali(root, data.CondizioniContrattuali);
      }

      if (data.ZoneOfferta) {
        this.addZoneOfferta(root, data.ZoneOfferta);
      }

      if (data.Sconto && data.Sconto.length > 0) {
        this.addSconti(root, data.Sconto);
      }

      if (data.ProdottiServiziAggiuntivi && data.ProdottiServiziAggiuntivi.length > 0) {
        this.addProdottiServiziAggiuntivi(root, data.ProdottiServiziAggiuntivi);
      }

      return root.end(this.options);
    } catch (error) {
      if (error instanceof XMLGenerationError) {
        throw error;
      }

      throw new XMLGenerationError(
        "Unexpected error during XML generation",
        "unknown",
        undefined,
        error as Error
      );
    }
  }

  private addIdentificativi(parent: any, data: SIIOfferta["IdentificativiOfferta"]) {
    const node = parent.ele("IdentificativiOfferta");
    node.ele("PIVA_UTENTE").txt(data.PIVA_UTENTE);
    node.ele("COD_OFFERTA").txt(data.COD_OFFERTA);
  }

  private addDettaglioOfferta(parent: any, data: SIIOfferta["DettaglioOfferta"]) {
    const node = parent.ele("DettaglioOfferta");
    node.ele("TIPO_MERCATO").txt(data.TIPO_MERCATO);
    
    if (data.OFFERTA_SINGOLA) {
      node.ele("OFFERTA_SINGOLA").txt(data.OFFERTA_SINGOLA);
    }
    
    node.ele("TIPO_CLIENTE").txt(data.TIPO_CLIENTE);
    
    if (data.DOMESTICO_RESIDENTE) {
      node.ele("DOMESTICO_RESIDENTE").txt(data.DOMESTICO_RESIDENTE);
    }
    
    node.ele("TIPO_OFFERTA").txt(data.TIPO_OFFERTA);
    
    // Add TIPOLOGIA_ATT_CONTR elements
    data.TIPOLOGIA_ATT_CONTR.forEach(tipo => {
      node.ele("TIPOLOGIA_ATT_CONTR").txt(tipo);
    });
    
    node.ele("NOME_OFFERTA").txt(data.NOME_OFFERTA);
    node.ele("DESCRIZIONE").txt(data.DESCRIZIONE);
    node.ele("DURATA").txt(data.DURATA.toString());
    node.ele("GARANZIE").txt(data.GARANZIE);
  }

  private addModalitaAttivazione(parent: any, data: SIIOfferta["DettaglioOfferta.ModalitaAttivazione"]) {
    const node = parent.ele("DettaglioOfferta.ModalitaAttivazione");
    
    // Add MODALITA elements
    data.MODALITA.forEach(modalita => {
      node.ele("MODALITA").txt(modalita);
    });
    
    if (data.DESCRIZIONE) {
      node.ele("DESCRIZIONE").txt(data.DESCRIZIONE);
    }
  }

  private addContatti(parent: any, data: SIIOfferta["DettaglioOfferta.Contatti"]) {
    const node = parent.ele("DettaglioOfferta.Contatti");
    node.ele("TELEFONO").txt(data.TELEFONO);
    
    if (data.URL_SITO_VENDITORE) {
      node.ele("URL_SITO_VENDITORE").txt(data.URL_SITO_VENDITORE);
    }
    
    if (data.URL_OFFERTA) {
      node.ele("URL_OFFERTA").txt(data.URL_OFFERTA);
    }
  }

  private addValiditaOfferta(parent: any, data: SIIOfferta["ValiditaOfferta"]) {
    const node = parent.ele("ValiditaOfferta");
    node.ele("DATA_INIZIO").txt(data.DATA_INIZIO);
    node.ele("DATA_FINE").txt(data.DATA_FINE);
  }

  private addMetodiPagamento(parent: any, data: SIIOfferta["MetodoPagamento"]) {
    data.forEach(metodo => {
      const node = parent.ele("MetodoPagamento");
      node.ele("MODALITA_PAGAMENTO").txt(metodo.MODALITA_PAGAMENTO);
      
      if (metodo.DESCRIZIONE) {
        node.ele("DESCRIZIONE").txt(metodo.DESCRIZIONE);
      }
    });
  }

  private addRiferimentiPrezzoEnergia(parent: any, data: NonNullable<SIIOfferta["RiferimentiPrezzoEnergia"]>) {
    const node = parent.ele("RiferimentiPrezzoEnergia");
    node.ele("IDX_PREZZO_ENERGIA").txt(data.IDX_PREZZO_ENERGIA);
    
    if (data.ALTRO) {
      node.ele("ALTRO").txt(data.ALTRO);
    }
  }

  private addCaratteristicheOfferta(parent: any, data: NonNullable<SIIOfferta["CaratteristicheOfferta"]>) {
    const node = parent.ele("CaratteristicheOfferta");
    
    if (data.CONSUMO_MIN !== undefined) {
      node.ele("CONSUMO_MIN").txt(data.CONSUMO_MIN.toString());
    }
    
    if (data.CONSUMO_MAX !== undefined) {
      node.ele("CONSUMO_MAX").txt(data.CONSUMO_MAX.toString());
    }
    
    if (data.POTENZA_MIN !== undefined) {
      node.ele("POTENZA_MIN").txt(this.formatter.formatDecimal(data.POTENZA_MIN, 1));
    }
    
    if (data.POTENZA_MAX !== undefined) {
      node.ele("POTENZA_MAX").txt(this.formatter.formatDecimal(data.POTENZA_MAX, 1));
    }
  }

  private addOffertaDUAL(parent: any, data: NonNullable<SIIOfferta["OffertaDUAL"]>) {
    const node = parent.ele("OffertaDUAL");
    
    data.OFFERTE_CONGIUNTE_EE.forEach(offerta => {
      node.ele("OFFERTE_CONGIUNTE_EE").txt(offerta);
    });
    
    data.OFFERTE_CONGIUNTE_GAS.forEach(offerta => {
      node.ele("OFFERTE_CONGIUNTE_GAS").txt(offerta);
    });
  }

  private addComponentiRegolate(parent: any, data: NonNullable<SIIOfferta["ComponentiRegolate"]>) {
    const node = parent.ele("ComponentiRegolate");
    
    data.CODICE.forEach(codice => {
      node.ele("CODICE").txt(codice);
    });
  }

  private addTipoPrezzo(parent: any, data: NonNullable<SIIOfferta["TipoPrezzo"]>) {
    const node = parent.ele("TipoPrezzo");
    node.ele("TIPOLOGIA_FASCE").txt(data.TIPOLOGIA_FASCE);
  }

  private addFasceOrarieSettimanale(parent: any, data: NonNullable<SIIOfferta["FasceOrarieSettimanale"]>) {
    const node = parent.ele("FasceOrarieSettimanale");
    node.ele("F_LUNEDI").txt(data.F_LUNEDI);
    node.ele("F_MARTEDI").txt(data.F_MARTEDI);
    node.ele("F_MERCOLEDI").txt(data.F_MERCOLEDI);
    node.ele("F_GIOVEDI").txt(data.F_GIOVEDI);
    node.ele("F_VENERDI").txt(data.F_VENERDI);
    node.ele("F_SABATO").txt(data.F_SABATO);
    node.ele("F_DOMENICA").txt(data.F_DOMENICA);
    node.ele("F_FESTIVITA").txt(data.F_FESTIVITA);
  }

  private addDispaciamento(parent: any, data: NonNullable<SIIOfferta["Dispacciamento"]>) {
    data.forEach(disp => {
      const node = parent.ele("Dispacciamento");
      node.ele("TIPO_DISPACCIAMENTO").txt(disp.TIPO_DISPACCIAMENTO);
      
      if (disp.VALORE_DISP !== undefined) {
        node.ele("VALORE_DISP").txt(this.formatter.formatDecimal(disp.VALORE_DISP, 6));
      }
      
      node.ele("NOME").txt(disp.NOME);
      
      if (disp.DESCRIZIONE) {
        node.ele("DESCRIZIONE").txt(disp.DESCRIZIONE);
      }
    });
  }

  private addComponenteImpresa(parent: any, data: NonNullable<SIIOfferta["ComponenteImpresa"]>) {
    data.forEach(comp => {
      const node = parent.ele("ComponenteImpresa");
      node.ele("NOME").txt(comp.NOME);
      node.ele("DESCRIZIONE").txt(comp.DESCRIZIONE);
      node.ele("TIPOLOGIA").txt(comp.TIPOLOGIA);
    });
  }

  private addCondizioniContrattuali(parent: any, data: NonNullable<SIIOfferta["CondizioniContrattuali"]>) {
    data.forEach(cond => {
      const node = parent.ele("CondizioniContrattuali");
      node.ele("VOCE").txt(cond.VOCE);
      
      if (cond.DESCRIZIONE) {
        node.ele("DESCRIZIONE").txt(cond.DESCRIZIONE);
      }
    });
  }

  private addZoneOfferta(parent: any, data: NonNullable<SIIOfferta["ZoneOfferta"]>) {
    const node = parent.ele("ZoneOfferta");
    
    data.ZONA.forEach(zona => {
      node.ele("ZONA").txt(zona);
    });
  }

  private addSconti(parent: any, data: NonNullable<SIIOfferta["Sconto"]>) {
    data.forEach(sconto => {
      const node = parent.ele("Sconto");
      node.ele("NOME").txt(sconto.NOME);
      
      if (sconto.DESCRIZIONE) {
        node.ele("DESCRIZIONE").txt(sconto.DESCRIZIONE);
      }
    });
  }

  private addProdottiServiziAggiuntivi(parent: any, data: NonNullable<SIIOfferta["ProdottiServiziAggiuntivi"]>) {
    data.forEach(prod => {
      const node = parent.ele("ProdottiServiziAggiuntivi");
      node.ele("NOME").txt(prod.NOME);
      
      if (prod.DESCRIZIONE) {
        node.ele("DESCRIZIONE").txt(prod.DESCRIZIONE);
      }
    });
  }
} 