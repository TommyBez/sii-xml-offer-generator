// Auto-generated TypeScript types from XSD schema
// Do not edit manually - regenerate from XSD instead

export enum TipoMercato {
  Elettrico = "01", // Elettrico
  Gas = "02", // Gas
  DualFuel = "03", // Dual Fuel
}

export enum TipoCliente {
  Domestico = "01", // Domestico
  AltriUsi = "02", // Altri Usi
  CondominioUsoDomestico = "03", // Condominio Uso Domestico (Gas)
}

export enum TipoOfferta {
  Fisso = "01", // Fisso
  Variabile = "02", // Variabile
  FLAT = "03", // FLAT
}

export enum TipologiaAttContr {
  CambioFornitore = "01", // Cambio Fornitore
  PrimaAttivazione = "02", // Prima Attivazione
  Riattivazione = "03", // Riattivazione
  Voltura = "04", // Voltura
  Sempre = "99", // Sempre
}

export enum ModalitaPagamento {
  DomiciliazioneBancaria = "01", // Domiciliazione bancaria
  DomiciliazionePostale = "02", // Domiciliazione postale
  DomiciliazioneSuCartaDiCredito = "03", // Domiciliazione su carta di credito
  BollettinoPrecompilato = "04", // Bollettino precompilato
  Altro = "99", // Altro
}

export enum ModalitaAttivazione {
  SoloWeb = "01", // Offerta attivabile solo da web
  QualsiisiCanale = "02", // Offerta attivabile da qualsiasi canale
  PuntoVendita = "03", // Presso punto vendita
  Teleselling = "04", // Teleselling
  Agenzia = "05", // Agenzia
  Altro = "99", // Altro
}

export enum DomesticoResidente {
  Residente = "01", // Domestico Residente
  NonResidente = "02", // Domestico NON Residente
  Tutte = "03", // Tutte
}

export enum IndicePrezzo {
  PUNTrimestrale = "01", // PUN trimestrale
  TTFTrimestrale = "02", // TTF trimestrale
  PSVTrimestrale = "03", // PSV trimestrale
  PsbilTrimestrale = "04", // Psbil trimestrale
  PETrimestrale = "05", // PE trimestrale
  CmemTrimestrale = "06", // Cmem trimestrale
  PforTrimestrale = "07", // Pfor trimestrale
  PUNBimestrale = "08", // PUN bimestrale
  TTFBimestrale = "09", // TTF bimestrale
  PSVBimestrale = "10", // PSV bimestrale
  PsbilBimestrale = "11", // Psbil bimestrale
  PUNMensile = "12", // PUN mensile
  TTFMensile = "13", // TTF mensile
  PSVMensile = "14", // PSV mensile
  PsbilMensile = "15", // Psbil mensile
  Altro = "99", // Altro
}

export enum ComponenteRegolata {
  PCV = "01", // PCV
  PPE = "02", // PPE
  CCR = "03", // CCR
  CPR = "04", // CPR
  GRAD = "05", // GRAD
  QTint = "06", // QTint
  QTpsv = "07", // QTpsv
  QVDFissa = "09", // QVD_fissa
  QVDVariabile = "10", // QVD_Variabile
}

export enum TipologiaFasce {
  Monorario = "01", // monorario
  F1F2 = "02", // F1, F2
  F1F2F3 = "03", // F1, F2, F3
  F1F2F3F4 = "04", // F1, F2, F3, F4
  F1F2F3F4F5 = "05", // F1, F2, F3, F4, F5
  F1F2F3F4F5F6 = "06", // F1, F2, F3, F4, F5, F6
  PeakOffPeak = "07", // Peak/OffPeak
  BiorarioF1F23 = "91", // biorario (F1 / F2+F3)
  BiorarioF2F13 = "92", // biorario (F2 / F1+F3)
  BiorarioF3F12 = "93", // biorario (F3 / F1+F2)
}

export enum TipoDispaciamento {
  DispDel11106 = "01", // Disp. del.111/06
  PD = "02", // PD
  MSD = "03", // MSD
  ModulazioneEolico = "04", // Modulazione Eolico
  UnitaEssenziali = "05", // Unità essenziali
  FunzTerna = "06", // Funz. Terna
  CapacitaProduttiva = "07", // Capacità Produttiva
  Interrompibilita = "08", // Interrompibilità
  CorrispetivoCapacitaMercatoSTG = "09", // Corrispettivo Capacità di Mercato STG
  CorrispetivoCapacitaMercatoMT = "10", // Corrispettivo capacità di mercato MT
  ReintegrazioneOneriSalvaguardia = "11", // Reintegrazione oneri salvaguardia
  ReintegrazioneOneriTuteleGraduali = "12", // Reintegrazione oneri tutele graduali
  DispBT = "13", // DispBT
  Altro = "99", // Altro
}

export interface SIIOfferta {
  IdentificativiOfferta: {
    PIVA_UTENTE: string; // Max length: 16
    COD_OFFERTA: string; // Max length: 32
  };
  DettaglioOfferta: {
    TIPO_MERCATO: TipoMercato;
    OFFERTA_SINGOLA?: "SI" | "NO";
    TIPO_CLIENTE: TipoCliente;
    DOMESTICO_RESIDENTE?: DomesticoResidente;
    TIPO_OFFERTA: TipoOfferta;
    TIPOLOGIA_ATT_CONTR: TipologiaAttContr[];
    NOME_OFFERTA: string; // Max length: 255
    DESCRIZIONE: string; // Max length: 3000
    DURATA: number; // Min: -1, Max: 99
    GARANZIE: string; // Max length: 3000
  };
  "DettaglioOfferta.ModalitaAttivazione": {
    MODALITA: ModalitaAttivazione[];
    DESCRIZIONE?: string; // Max length: 2000
  };
  "DettaglioOfferta.Contatti": {
    TELEFONO: string; // Max length: 15
    URL_SITO_VENDITORE?: string; // Max length: 100
    URL_OFFERTA?: string; // Max length: 100
  };
  ValiditaOfferta: {
    DATA_INIZIO: string; // Format: DD/MM/YYYY_HH:MM:SS
    DATA_FINE: string;   // Format: DD/MM/YYYY_HH:MM:SS
  };
  MetodoPagamento: Array<{
    MODALITA_PAGAMENTO: ModalitaPagamento;
    DESCRIZIONE?: string; // Max length: 25
  }>;
  RiferimentiPrezzoEnergia?: {
    IDX_PREZZO_ENERGIA: IndicePrezzo;
    ALTRO?: string; // Max length: 3000
  };
  CaratteristicheOfferta?: {
    CONSUMO_MIN?: number; // Total digits: 9
    CONSUMO_MAX?: number; // Total digits: 9
    POTENZA_MIN?: number; // Total digits: 3, Fraction digits: 1
    POTENZA_MAX?: number; // Total digits: 3, Fraction digits: 1
  };
  OffertaDUAL?: {
    OFFERTE_CONGIUNTE_EE: string[]; // Max length: 32 each
    OFFERTE_CONGIUNTE_GAS: string[]; // Max length: 32 each
  };
  ComponentiRegolate?: {
    CODICE: ComponenteRegolata[];
  };
  TipoPrezzo?: {
    TIPOLOGIA_FASCE: TipologiaFasce;
  };
  FasceOrarieSettimanale?: {
    F_LUNEDI: string; // Max length: 49
    F_MARTEDI: string; // Max length: 49
    F_MERCOLEDI: string; // Max length: 49
    F_GIOVEDI: string; // Max length: 49
    F_VENERDI: string; // Max length: 49
    F_SABATO: string; // Max length: 49
    F_DOMENICA: string; // Max length: 49
    F_FESTIVITA: string; // Max length: 49
  };
  Dispacciamento?: Array<{
    TIPO_DISPACCIAMENTO: TipoDispaciamento;
    VALORE_DISP?: number; // Total digits: 7, Fraction digits: 6
    NOME: string; // Max length: 25
    DESCRIZIONE?: string; // Max length: 255
  }>;
  ComponenteImpresa?: Array<{
    NOME: string; // Max length: 255
    DESCRIZIONE: string; // Max length: 255
    TIPOLOGIA: string;
  }>;
  CondizioniContrattuali?: Array<{
    VOCE: string;
    DESCRIZIONE?: string;
  }>;
  ZoneOfferta?: {
    ZONA: string[];
  };
  Sconto?: Array<{
    NOME: string;
    DESCRIZIONE?: string;
  }>;
  ProdottiServiziAggiuntivi?: Array<{
    NOME: string;
    DESCRIZIONE?: string;
  }>;
} 