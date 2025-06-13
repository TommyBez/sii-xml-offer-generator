# Functional Requirements Document
## Energy Offer XML Generator Application

Version: 1.0  
Date: March 3, 2025

## 1. Introduction

### 1.1 Purpose
This document outlines the functional requirements for a web application designed to collect data and generate XML files compliant with the SII (Sistema Informativo Integrato) specifications for energy and gas market offers in Italy, as described in document "Trasmissione Offerte" version 4.5 dated December 6, 2023.

### 1.2 Scope
The application will provide a user-friendly interface for energy providers to input their offer details, validate the data according to SII requirements, and generate properly formatted XML files ready for submission to the SII platform. The system must strictly adhere to all format constraints, field validations, and conditional requirements outlined in the SII specification.

### 1.3 Definitions and Acronyms
- **SII**: Sistema Informativo Integrato per la Gestione dei Flussi Informativi Relativi ai Mercati dell'Energia Elettrica e del Gas
- **XML**: Extensible Markup Language
- **PIVA**: Partita IVA (Italian VAT Number)
- **Offer**: Energy or gas service proposal from a provider to potential customers
- **Mercato libero**: Free market (as opposed to regulated market)
- **PUN**: Prezzo Unico Nazionale (National Single Price)
- **TTF**: Title Transfer Facility (European gas price index)
- **PSV**: Punto di Scambio Virtuale (Virtual Trading Point for gas)

## 2. System Overview

The Energy Offer XML Generator is a web application that will guide users through the process of creating offer submissions compliant with SII requirements. The system will collect all necessary data through structured forms, validate the input, and generate XML files that adhere to the format specified in the "Trasmissione Offerte" document version 4.5.

## 3. Functional Requirements

### 3.1 User Management

No authentication or user management is required

### 3.2 Offer Creation and Management

#### 3.2.1 Offer Creation
- FR-2.1: The system shall provide a step-by-step interface for creating new offers.
- FR-2.2: The system shall guide users through all required sections defined in the SII specification.
- FR-2.3: The system shall support both creation of new offers ("INSERIMENTO") and updating existing offers ("AGGIORNAMENTO").
- FR-2.4: The system shall enforce the XML file naming convention: `<PIVA_UTENTE>_<AZIONE>_<DESCRIZIONE>.XML` where:
  - PIVA_UTENTE: represents the VAT number of the accredited user (Alfanumerico, 16 chars)
  - AZIONE: represents the action to perform, either 'INSERIMENTO' for new offers or 'AGGIORNAMENTO' for updating existing offers
  - DESCRIZIONE: free text field, maximum 25 alphanumeric characters (spaces and underscores not allowed)

#### 3.2.2 Offer Management
- FR-2.5: Offers will not be persisted anywhere

### 3.3 Data Collection Forms

#### 3.3.1 Identification Information (Identificativi Offerta)
- FR-3.1: The system shall collect basic offer identification information:
  - Partita IVA (PIVA_UTENTE) - Alfanumerico (16)
  - Offer code (COD_OFFERTA) - Alfanumerico (32) - This is the unique code that will be used in the CODICE CONTRATTO field during the subscription of the offer by the end customer in the switching request.

#### 3.3.2 Offer Details (DettaglioOfferta)
- FR-3.2: The system shall collect market type information (TIPO_MERCATO):
  - Electricity (01)
  - Gas (02)
  - Dual Fuel (03)
  This field is mandatory and must be Alfanumerico (2).

- FR-3.3: The system shall collect if the offer can be subscribed individually (OFFERTA_SINGOLA):
  - Yes (SI) - offer can be subscribed individually
  - No (NO) - offer can only be subscribed in combination with an offer of another commodity
  This field is mandatory if TIPO_MERCATO is not 03 (Dual Fuel) and must be Alfanumerico (2).

- FR-3.4: The system shall collect client type information (TIPO_CLIENTE):
  - Domestic (01)
  - Other Uses (02)
  - Residential Condominium (Gas) (03)
  This field is mandatory and must be Numerico (2).

- FR-3.5: The system shall collect residential status (DOMESTICO_RESIDENTE) when applicable:
  - Domestic Resident (01)
  - Domestic Non-Resident (02)
  - All types (03)
  This field is optional and must be Alfanumerico (2).

- FR-3.6: The system shall collect offer type details (TIPO_OFFERTA):
  - Fixed (01)
  - Variable (02)
  - FLAT (03)
  This field is mandatory and must be Numerico (2).

- FR-3.7: The system shall collect contract activation types (TIPOLOGIA_ATT_CONTR):
  - Supplier Change (01)
  - First Activation (Meter not present) (02)
  - Reactivation (Meter present but deactivated) (03)
  - Contract Transfer (04)
  - Always (99)
  This field is mandatory, must be Numerico (2), and can occur multiple times (marked with * in the specification).

- FR-3.8: The system shall collect the offer name (NOME_OFFERTA) - Alfanumerico (255), mandatory.

- FR-3.9: The system shall collect offer description (DESCRIZIONE) - Alfanumerico (3000), mandatory.

- FR-3.10: The system shall collect offer duration in months (DURATA), specifying the duration of the economic conditions:
  - Value -1 for indeterminate duration
  - Otherwise, a value from 1 to 99
  This field is mandatory and must be Numerico (2).

- FR-3.11: The system shall collect information about required guarantees (GARANZIE) such as security deposits/domiciliation. If no guarantee is required, the value should be "NO". This field is mandatory and must be Alfanumerico (3000).

#### 3.3.3 Activation Methods (DettaglioOfferta/ModalitaAttivazione)
- FR-3.12: The system shall collect activation methods (MODALITA) with multiple selection capability:
  - Web-only activation (01)
  - Any channel activation (02)
  - Point of sale (03)
  - Teleselling (04)
  - Agency (05)
  - Other (99)
  This field is mandatory, must be Alfanumerico (2), and can occur multiple times.

- FR-3.13: The system shall collect a description (DESCRIZIONE) when "Other" (99) is selected for activation method. This field is mandatory when MODALITA = 99 and must be Alfanumerico (2000).

#### 3.3.4 Contact Information (DettaglioOfferta/Contatti)
- FR-3.14: The system shall collect contact details:
  - Phone number (TELEFONO) - Alfanumerico (15), mandatory
  - Vendor website (URL_SITO_VENDITORE) - Alfanumerico (100), mandatory if available
  - Offer URL (URL_OFFERTA) - Alfanumerico (100), mandatory if available

#### 3.3.5 Energy Price References (RiferimentiPrezzoEnergia)
- FR-3.15: The system shall collect price index information (IDX_PREZZO_ENERGIA) for variable offers. This section is mandatory only if TIPO_OFFERTA = 02 (Variable) and SCONTO/TIPOLOGIA is not 04 (if at least one discount is present). The field must be Numerico (2) with the following values for the index periodicity:
  - Quarterly:
    - PUN (01)
    - TTF (02)
    - PSV (03)
    - Psbil (04)
    - PE (05)
    - Cmem (06)
    - Pfor (07)
  - Bimonthly:
    - PUN (08)
    - TTF (09)
    - PSV (10)
    - Psbil (11)
  - Monthly:
    - PUN (12)
    - TTF (13)
    - PSV (14)
    - Psbil (15)
    - Other (99)
  
  Note: Code '99' represents an index not managed by the Portal. The offer will be accepted by SII but will not be visible on the Offers Portal. The offer will become visible once SII implements the index; the User will be informed about the related timing. Reception of the offer alone makes the User compliant with the regulation.

- FR-3.16: The system shall collect alternative index description (ALTRO) when "Other" (99) is selected for IDX_PREZZO_ENERGIA. This field is mandatory when IDX_PREZZO_ENERGIA = 99 and must be Alfanumerico (3000).

#### 3.3.6 Offer Validity (ValiditaOfferta)
- FR-3.17: The system shall collect validity start date (DATA_INIZIO) in timestamp format. This field is mandatory and must be in format GG/MM/AAAA_HH:MM:SS.

- FR-3.18: The system shall collect validity end date (DATA_FINE) in timestamp format. This field is mandatory and must be in format GG/MM/AAAA_HH:MM:SS.

#### 3.3.7 Offer Characteristics (CaratteristicheOfferta)
- FR-3.19: The system shall collect consumption limits when applicable:
  - Minimum consumption (CONSUMO_MIN) - This field is mandatory if TIPO_OFFERTA = 03 (FLAT) and must be Numerico (9)
  - Maximum consumption (CONSUMO_MAX) - This field is mandatory if TIPO_OFFERTA = 03 (FLAT) and must be Numerico (9)

- FR-3.20: The system shall collect power limits for electricity offers when applicable:
  - Minimum power (POTENZA_MIN) - This field is optional, must be Numerico (2,1) with decimal separator '.'
  - Maximum power (POTENZA_MAX) - This field is optional, must be Numerico (2,1) with decimal separator '.'

#### 3.3.8 Dual Offer (OffertaDUAL)
- FR-3.21: The system shall collect associated offer codes for Dual Fuel offers:
  - Electricity offer codes (OFFERTE_CONGIUNTE_EE) - This field is mandatory if TIPO_MERCATO = 03, must be Alfanumerico (32), can occur multiple times
  - Gas offer codes (OFFERTE_CONGIUNTE_GAS) - This field is mandatory if TIPO_MERCATO = 03, must be Alfanumerico (32), can occur multiple times

#### 3.3.9 Payment Methods (MetodoPagamento)
- FR-3.22: The system shall allow selection of multiple payment methods (MODALITA_PAGAMENTO):
  - Bank direct debit (01)
  - Postal direct debit (02)
  - Credit card direct debit (03)
  - Pre-filled bulletin (04)
  - Other (99)
  This field is mandatory, must be Alfanumerico (2), and can occur multiple times.

- FR-3.23: The system shall collect payment method description (DESCRIZIONE) when "Other" (99) is selected for MODALITA_PAGAMENTO. This field is mandatory when MODALITA_PAGAMENTO = 99 and must be Alfanumerico (25).

#### 3.3.10 Regulated Components (ComponentiRegolate)
- FR-3.24: The system shall allow selection of regulated components (CODICE) defined by the authority:
  - For Electricity (TIPO_MERCATO = 01):
    - PCV (01)
    - PPE (02)
  - For Gas (TIPO_MERCATO = 02):
    - CCR (03)
    - CPR (04)
    - GRAD (05)
    - QTint (06)
    - QTpsv (07)
    - QVD_fissa (09)
    - QVD_Variabile (10)
  This field is optional, must be Alfanumerico (02), and can occur multiple times.

#### 3.3.11 Price Type (TipoPrezzo)
- FR-3.25: The system shall collect time band configuration (TIPOLOGIA_FASCE) for electricity offers. This section is mandatory if TIPO_MERCATO = 01 (Electricity) and TIPO_OFFERTA ≠ 03 (not FLAT). The field must be Alfanumerico (2) with the following values:
  - Monorario (01)
  - F1, F2 (02)
  - F1, F2, F3 (03) - Standard configuration for 3 time bands
  - F1, F2, F3, F4 (04)
  - F1, F2, F3, F4, F5 (05)
  - F1, F2, F3, F4, F5, F6 (06)
  - Peak/OffPeak (07) - Standard configuration for peak/off-peak
  - Biorario (F1 / F2+F3) (91)
  - Biorario (F2 / F1+F3) (92)
  - Biorario (F3 / F1+F2) (93)

#### 3.3.12 Weekly Time Bands (FasceOrarieSettimanale)
- FR-3.26: The system shall collect detailed weekly time bands when required. This section is mandatory if TIPOLOGIA_FASCE = 02 or 04 or 05 or 06, and includes:
  - Monday time bands (F_LUNEDI)
  - Tuesday time bands (F_MARTEDI)
  - Wednesday time bands (F_MERCOLEDI)
  - Thursday time bands (F_GIOVEDI)
  - Friday time bands (F_VENERDI)
  - Saturday time bands (F_SABATO)
  - Sunday time bands (F_DOMENICA)
  - Holiday time bands (F_FESTIVITA)
  
  Each field is mandatory, must be Alfanumerico (49), and follows the format:
  `XXI-YI,XXII-YII,..,XXN-YN` where:
  - XXi (numeric from 1 to 96): last quarter hour of application of the band
  - Yi (numeric from 1 to 8): number of the applied band (7:Peak , 8:OffPeak)
  - The following relations must always be verified:
    - XXi+1 > XXi
    - N <= 10
  
  Example:
  ```
  F3: 00:01 - 07:00
  F2: 07:00 - 08:00
  F1: 08:00 - 19:00
  F2: 19:00 - 23:00
  F3: 23:00 - 24:00
  ```
  becomes: `28-3,32-2,76-1,92-2,96-3`

#### 3.3.13 Dispatching (Dispacciamento)
- FR-3.27: The system shall collect dispatching component details for electricity offers. This section is mandatory if TIPO_MERCATO = 01 (Electricity), can occur multiple times, and includes:
  - Dispatching type (TIPO_DISPACCIAMENTO) - Mandatory, Numerico (2):
    - Disp. del.111/06 (01)
    - PD (02)
    - MSD (03)
    - Modulazione Eolico (04)
    - Unità essenziali (05)
    - Funz. Terna (06)
    - Capacità Produttiva (07)
    - Interrompibilità (08)
    - Corrispettivo Capacità di Mercato STG (09)
    - Corrispettivo capacità di mercato MT (10)
    - Reintegrazione oneri salvaguardia (11)
    - Reintegrazione oneri tutele graduali (12)
    - DispBT (13) - This is only considered in the Portal Offers expense calculation if selected by the vendor.
    - Altro (99)
  - Dispatching value (VALORE_DISP) - Mandatory if TIPO_DISPACCIAMENTO = 99, Numerico (1,6) with decimal separator '.'
  - Component name (NOME) - Mandatory, Alfanumerico (25)
  - Component description (DESCRIZIONE) - Optional, Alfanumerico (255)

#### 3.3.14 Company Components (ComponenteImpresa)
- FR-3.28: The system shall allow addition of multiple company components. This section is optional, can occur multiple times, and includes:
  - Component name (NOME) - Mandatory, Alfanumerico (255)
  - Component description (DESCRIZIONE) - Mandatory, Alfanumerico (255)
  - Component type (TIPOLOGIA) - Mandatory, Alfanumerico (2):
    - STANDARD (01) - Price included
    - OPTIONAL (02) - Price not included
  - Macro area (MACROAREA) - Mandatory, Numerico (2):
    - Fixed commercialization fee (01)
    - Energy commercialization fee (02)
    - Energy price component (04)
    - One-time fee (05)
    - Renewable energy / Green energy (06)

- FR-3.29: The system shall allow addition of price intervals for each company component (ComponenteImpresa/IntervalloPrezzi). This section is mandatory, can occur multiple times, and includes:
  - Time band (FASCIA_COMPONENTE) - Optional, Alfanumerico (2):
    - Monorario/F1 (01)
    - F2 (02)
    - F3 (03)
    - F4 (04)
    - F5 (05)
    - F6 (06)
    - Peak (07)
    - OffPeak (08)
    - F2+F3 (91)
    - F1+F3 (92)
    - F1+F2 (93)
  - Minimum consumption (CONSUMO_DA) - Optional, Numerico (9)
  - Maximum consumption (CONSUMO_A) - Optional, Numerico (9)
  - Price (PREZZO) - Mandatory, Numerico (6,6)
  - Unit of measure (UNITA_MISURA) - Mandatory, Numerico (2):
    - €/Year (01)
    - €/kW (02)
    - €/kWh (03)
    - €/Sm3 (04)
    - € (05)

  Note: In the IntervalloPrezzi section of the Componente Impresa, the CONSUMO_DA and CONSUMO_A values define the ranges in which the component price is applied. For example, if two ranges are defined, one from 0 to 100 with price X and one from 101 to 200 with price Y, if the user has a consumption of 150 (kW or Sm3), the component price will be calculated by steps. In this case, price X will be applied for the first 100 and price Y for the next 50 (100*X + 50*Y).

- FR-3.30: The system shall collect validity period information for each price interval (ComponenteImpresa/IntervalloPrezzi/PeriodoValidita). This section is optional and includes:
  - Duration in months (DURATA) - Optional, Numerico (2)
  - Valid until (VALIDO_FINO) - Optional, format MM/AAAA
  - Validity month (MESE_VALIDITA) - Optional, Numerico (2), can occur multiple times:
    - January (01) to December (12)

#### 3.3.15 Contractual Conditions (CondizioniContrattuali)
- FR-3.31: The system shall allow addition of multiple contractual conditions. This section is mandatory, can occur multiple times, and includes:
  - Condition type (TIPOLOGIA_CONDIZIONE) - Mandatory, Alfanumerico (2):
    - Activation (01)
    - Deactivation (02)
    - Withdrawal (03)
    - Multi-year Offer (04)
    - Early Withdrawal Charges (05) - This code can be inserted starting from January 1, 2024
    - Other (99)
  - Other condition type (ALTRO) - Mandatory if TIPOLOGIA_CONDIZIONE = 99, Alfanumerico (20)
  - Condition description (DESCRIZIONE) - Mandatory, Alfanumerico (3000)
  - Limiting condition flag (LIMITANTE) - Mandatory, Alfanumerico:
    - Yes, it is limiting (01)
    - No, it is not limiting (02)

#### 3.3.16 Offer Zones (ZoneOfferta)
- FR-3.32: The system shall allow specification of geographical availability. This section is optional and includes:
  - Regions (REGIONE) - Optional, Alfanumerico (2) where each code is Numerico (2), can occur multiple times
  - Provinces (PROVINCIA) - Optional, Alfanumerico (3) where each code is Numerico (3), can occur multiple times
  - Municipalities (COMUNE) - Optional, Alfanumerico (6) where each code is Numerico (6), can occur multiple times

#### 3.3.17 Discounts (Sconto)
- FR-3.33: The system shall allow addition of multiple discounts. This section is optional, can occur multiple times, and includes:
  - Discount name (NOME) - Mandatory, Alfanumerico (255)
  - Discount description (DESCRIZIONE) - Mandatory, Alfanumerico (3000)
  - Component/band code (CODICE_COMPONENTE_FASCIA) - Optional, Alfanumerico (02), can occur multiple times:
    - Components:
      - PCV (01) to QVD_Variabile (10)
    - Bands:
      - F1 (11) to F6 (16)
      - Peak (17), OffPeak (18)
      - F2+F3 (91), F1+F3 (92), F1+F2 (93)
  - Validity (VALIDITA) - Mandatory if PeriodoValidita section is not populated, Alfanumerico (2):
    - Entry (01)
    - Within 12 months (02)
    - Beyond 12 months (03)
  - VAT applicability (IVA_SCONTO) - Mandatory, Alfanumerico (2):
    - Yes (01)
    - No (02)

- FR-3.34: The system shall collect discount validity period (Sconto/PeriodoValidita). This section is optional and includes:
  - Duration in months (DURATA) - Optional, Numerico (2)
  - Valid until (VALIDO_FINO) - Optional, format MM/AAAA
  - Validity month (MESE_VALIDITA) - Optional, Numerico (2), can occur multiple times:
    - January (01) to December (12)

- FR-3.35: The system shall collect discount application conditions (Sconto/Condizione). This section is mandatory for each discount and includes:
  - Application condition (CONDIZIONE_APPLICAZIONE) - Mandatory, Alfanumerico (2):
    - Not conditioned (00)
    - Electronic billing (01)
    - Online management (02)
    - Electronic billing + bank direct debit (03)
    - Other (99)
  - Condition description (DESCRIZIONE_CONDIZIONE) - Mandatory if CONDIZIONE_APPLICAZIONE = 99, Alfanumerico (3000)

- FR-3.36: The system shall collect discount prices (Sconto/PREZZISconto). This section is mandatory (at least one for each discount), can occur multiple times, and includes:
  - Discount type (TIPOLOGIA) - Mandatory, Numerico (2):
    - Fixed discount (01)
    - Power discount (02)
    - Sales discount (03)
    - Discount on regulated price (04)
  - Valid from consumption (VALIDO_DA) - Optional, Numerico (9)
  - Valid to consumption (VALIDO_FINO) - Optional, Numerico (9)
  - Unit of measure (UNITA_MISURA) - Mandatory, Numerico (2):
    - €/Year (01)
    - €/kW (02)
    - €/kWh (03)
    - €/Sm3 (04)
    - € (05)
    - Percentage (06)
  - Price (PREZZO) - Mandatory, Numerico (6,6)

#### 3.3.18 Additional Products and Services (ProdottiServiziAggiuntivi)
- FR-3.37: The system shall allow addition of multiple additional products and services. This section is optional, can occur multiple times, and includes:
  - Product/service name (NOME) - Mandatory, Alfanumerico (255)
  - Product/service details (DETTAGLIO) - Mandatory, Alfanumerico (3000)
  - Macro area (MACROAREA) - Optional, Numerico (2):
    - Boiler (01)
    - Mobility (02)
    - Solar thermal (03)
    - Photovoltaic (04)
    - Air conditioning (05)
    - Insurance policy (06)
    - Other (99)
  - Macro area details (DETTAGLI_MACROAREA) - Mandatory if MACROAREA = 99, Alfanumerico (100)

### 3.4 Validation

#### 3.4.1 Field Validation
- FR-4.1: The system shall validate all input fields according to the format and constraints specified in the SII document, including:
  - Field length validation
  - Data type validation (numeric, alphanumeric, date formats)
  - Valid value validation (for fields with enumerated values)
  - Format pattern validation (for fields with specific patterns)

- FR-4.2: The system shall clearly indicate validation errors to users with specific error messages that explain the expected format and constraints.

- FR-4.3: The system shall prevent submission of forms with validation errors.

#### 3.4.2 Conditional Validation
- FR-4.4: The system shall enforce all conditional requirements based on selected options as detailed in sections 3.3.1 through 3.3.18, including:
  - Mandatory fields based on other field values
  - Field visibility based on other field values
  - Special format requirements based on field combinations

- FR-4.5: The system shall validate repeatable sections (marked with * in the specification) to ensure they comply with minimum and maximum occurrence constraints.

- FR-4.6: The system shall enforce the complex relationship rules between components, particularly:
  
  For TIPO_MERCATO = 02 (Gas), a ComponenteImpresa/IntervalloPrezzi section is mandatory for each ComponenteImpresa inserted.
  
  For TIPO_MERCATO = 01 (Electricity):
  - If MACROAREA (ComponenteImpresa) = 02, 04, or 06 and UNITA_MISURA (ComponenteImpresa/IntervalloPrezzi) = 03 (for all price intervals of the component), it is mandatory to insert a number of IntervalloPrezzi sections equal to the number of bands inserted in TIPOLOGIA_FASCE of the TipoPrezzo section.
  - If MACROAREA (ComponenteImpresa) = 01, 04, 05, or 06 and UNITA_MISURA (ComponenteImpresa/IntervalloPrezzi) = 01, 02, or 05, it is mandatory to insert a single IntervalloPrezzi for each "ComponentiImpresa" without populating the FASCIA_COMPONENTE field.

### 3.5 XML Generation

#### 3.5.1 File Format
- FR-5.1: The system shall generate XML files conforming to the SII specification version 4.5 (tracciato disponibile dal 01/12/2019 in sostituzione della precedente versione 01).

- FR-5.2: The system shall use UTF-8 encoding for all XML files.

- FR-5.3: The system shall include appropriate XML schema references.

#### 3.5.2 File Naming
- FR-5.4: The system shall name files according to the specified pattern:
  - <PIVA_UTENTE>_<AZIONE>_<DESCRIZIONE>.XML
  Where:
  - PIVA_UTENTE: VAT number of the accredited user
  - AZIONE: 'INSERIMENTO' for new offers, 'AGGIORNAMENTO' for updates
  - DESCRIZIONE: Free text field, maximum 25 alphanumeric characters (no spaces or underscores allowed)

#### 3.5.3 XML Structure
- FR-5.5: The system shall structure XML files with all required sections and fields as detailed in sections 3.3.1 through 3.3.18.

- FR-5.6: The system shall handle repeatable sections (marked with * in the specification) appropriately, allowing multiple occurrences where permitted.

- FR-5.7: The system shall maintain proper nesting of XML elements according to the specification.

- FR-5.8: The system shall support both simulable offers (format in section 7.1 of the SII document) and non-simulable offers (format in section 7.2 of the SII document).

### 3.6 Output Management

#### 3.6.1 Preview and Download
- FR-6.1: The system shall provide a preview of the generated XML.

- FR-6.2: The system shall allow users to download the generated XML file.

- FR-6.3: The system shall allow users to save the XML file to their account for future reference.

#### 3.6.2 Bulk Operations
- FR-6.4: The system shall allow batch generation of multiple XML files.

- FR-6.5: The system shall provide an option to download all generated files as a ZIP archive.

- FR-6.6: The system shall optionally compress XML files as mentioned in the SII document (though the web portal compresses the file after upload).

### 3.7 History and Logging

- FR-7.1: The system shall maintain a log of all XML files generated.

- FR-7.2: The system shall record timestamps for creation and modification of offers.

- FR-7.3: The system shall provide an audit trail of changes to offers.

## 4. Non-Functional Requirements

### 4.1 Performance
- NFR-1.1: The system shall load form pages within 2 seconds.
- NFR-1.2: The system shall generate XML files within 5 seconds.
- NFR-1.3: The system shall support concurrent use by multiple users.

### 4.2 Security
- NFR-2.1: The system shall encrypt all sensitive data in transit and at rest.
- NFR-2.2: The system shall implement secure authentication mechanisms.
- NFR-2.3: The system shall implement proper access controls.
- NFR-2.4: The system shall protect against common web vulnerabilities (OWASP Top 10).

### 4.3 Usability
- NFR-3.1: The system shall provide a responsive interface accessible from different devices.
- NFR-3.2: The system shall include inline help text and tooltips explaining field requirements.
- NFR-3.3: The system shall provide clear error messages that guide users to fix issues.
- NFR-3.4: The system shall save form progress automatically to prevent data loss.
- NFR-3.5: The system shall provide contextual help for complex fields, particularly for:
  - Time band configuration (explaining the format XXI-YI,XXII-YII,..,XXN-YN)
  - Price interval configuration (explaining the consumption range calculation)
  - Conditional field requirements

### 4.4 Reliability
- NFR-4.1: The system shall be available 99.9% of the time.
- NFR-4.2: The system shall implement backup and recovery mechanisms.
- NFR-4.3: The system shall handle errors gracefully without data loss.

### 4.5 Compatibility
- NFR-5.1: The system shall function properly on modern web browsers (Chrome, Firefox, Safari, Edge).
- NFR-5.2: The system shall be compatible with desktop and tablet devices.

## 5. System Interfaces

### 5.1 User Interfaces
- SI-1.1: The system shall provide a web-based user interface accessible via standard browsers.
- SI-1.2: The system shall implement a responsive design that adapts to different screen sizes.
- SI-1.3: The system shall provide clear visual indications of form progress and completion status.
- SI-1.4: The system shall organize the complex form in a tabbed or wizard interface to manage the numerous fields and sections effectively.

### 5.2 External Interfaces
- SI-2.1: The system shall export data in XML format compliant with SII specifications version 4.5.
- SI-2.2: The system shall optionally integrate with the SII portal for direct submission (future enhancement).

## 6. Future Enhancements

- FE-1: Integration with the SII portal for direct submission of XML files.
- FE-2: Automated validation against the latest SII schema definitions.
- FE-3: Template library for common offer configurations.
- FE-4: Offer comparison and analysis tools.
- FE-5: Integration with enterprise systems for automated data import.
- FE-6: Support for future versions of the SII specification.

## 7. Appendices

### 7.1 XML File Structure
The generated XML files shall conform to the structure defined in "Trasmissione Offerte" version 4.5, with all required sections and fields. The primary sections include:

1. Identificativi Offerta (Offer Identifiers)
2. DettaglioOfferta (Offer Details)
3. DettaglioOfferta.ModalitaAttivazione (Activation Methods)
4. DettaglioOfferta.Contatti (Contacts)
5. RiferimentiPrezzoEnergia (Energy Price References)
6. ValiditaOfferta (Offer Validity)
7. Caratteristiche Offerta (Offer Characteristics)
8. OffertaDUAL (Dual Offers)
9. MetodoPagamento (Payment Methods)
10. ComponentiRegolate (Regulated Components)
11. TipoPrezzo (Price Type)
12. FasceOrarieSettimanale (Weekly Time Bands)
13. Dispacciamento (Dispatching)
14. ComponenteImpresa (Company Components)
15. Condizioni contrattuali (Contractual Conditions)
16. Zone Offerta (Offer Zones)
17. Sconto (Discounts)
18. ProdottiServiziAggiuntivi (Additional Products and Services)

### 7.2 File Naming Convention
File names shall follow the pattern:
- <PIVA_UTENTE>_<AZIONE>_<DESCRIZIONE>.XML

Where:
- PIVA_UTENTE: VAT number of the accredited user
- AZIONE: Action to perform (INSERIMENTO for new offers, AGGIORNAMENTO for updates)
- DESCRIZIONE: Free text field, maximum 25 alphanumeric characters (no spaces or underscores)

### 7.3 Special Notes
1. For price interval consumption ranges, the price is calculated by steps. If two ranges are defined (0-100 with price X and 101-200 with price Y) and consumption is 150, then the price is calculated as 100*X + 50*Y.

2. The code '99' for IDX_PREZZO_ENERGIA represents an index not managed by the Portal. The offer will be accepted by SII but not visible on the Offers Portal until SII implements the index.

3. The DispBT component (TIPO_DISPACCIAMENTO = 13) is only considered in the expense calculation if selected by the vendor.

4. The Early Withdrawal Charges condition (TIPOLOGIA_CONDIZIONE = 05) can only be used starting from January 1, 2024.

5. For time band formats (F_LUNEDI, etc.), the format XXI-YI,XXII-YII,...,XXN-YN requires that XXi+1 > XXi and N <= 10.

6. Configurations TIPOLOGIA_FASCIA = 03 (F1, F2, F3) and TIPOLOGIA_FASCIA = 07 (Peak/OffPeak) allow inheriting standard configurations if the FasceOrarieSettimanali section is not populated.
