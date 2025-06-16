import { getDefaultValidator, fastValidator, enhanceXSDErrors, formatErrorForDisplay } from "./index";

// Test XML samples
const validXML = `<?xml version="1.0" encoding="UTF-8"?>
<Offerta>
  <IdentificativiOfferta>
    <PIVA_UTENTE>12345678901</PIVA_UTENTE>
    <COD_OFFERTA>TEST-OFFER-001</COD_OFFERTA>
  </IdentificativiOfferta>
  <DettaglioOfferta>
    <TIPO_MERCATO>01</TIPO_MERCATO>
    <TIPO_CLIENTE>01</TIPO_CLIENTE>
    <TIPO_OFFERTA>01</TIPO_OFFERTA>
    <TIPOLOGIA_ATT_CONTR>01</TIPOLOGIA_ATT_CONTR>
    <NOME_OFFERTA>Test Offer Name</NOME_OFFERTA>
    <DESCRIZIONE>This is a test offer description</DESCRIZIONE>
    <DURATA>12</DURATA>
    <GARANZIE>Test guarantees</GARANZIE>
  </DettaglioOfferta>
  <DettaglioOfferta.ModalitaAttivazione>
    <MODALITA>01</MODALITA>
    <DESCRIZIONE>Web activation only</DESCRIZIONE>
  </DettaglioOfferta.ModalitaAttivazione>
  <DettaglioOfferta.Contatti>
    <TELEFONO>+39123456789</TELEFONO>
    <URL_SITO_VENDITORE>https://example.com</URL_SITO_VENDITORE>
  </DettaglioOfferta.Contatti>
  <ValiditaOfferta>
    <DATA_INIZIO>01/01/2024_00:00:00</DATA_INIZIO>
    <DATA_FINE>31/12/2024_23:59:59</DATA_FINE>
  </ValiditaOfferta>
  <MetodoPagamento>
    <MODALITA_PAGAMENTO>01</MODALITA_PAGAMENTO>
    <DESCRIZIONE>Bank transfer</DESCRIZIONE>
  </MetodoPagamento>
</Offerta>`;

const invalidXML = `<?xml version="1.0" encoding="UTF-8"?>
<Offerta>
  <IdentificativiOfferta>
    <PIVA_UTENTE>123456789012345678</PIVA_UTENTE> <!-- Too long -->
    <COD_OFFERTA>TEST-OFFER-001</COD_OFFERTA>
  </IdentificativiOfferta>
  <DettaglioOfferta>
    <TIPO_MERCATO>99</TIPO_MERCATO> <!-- Invalid enum -->
    <TIPO_CLIENTE>01</TIPO_CLIENTE>
    <TIPO_OFFERTA>01</TIPO_OFFERTA>
    <TIPOLOGIA_ATT_CONTR>01</TIPOLOGIA_ATT_CONTR>
    <NOME_OFFERTA>Test Offer Name</NOME_OFFERTA>
    <DESCRIZIONE>This is a test offer description</DESCRIZIONE>
    <DURATA>200</DURATA> <!-- Out of range -->
    <GARANZIE>Test guarantees</GARANZIE>
  </DettaglioOfferta>
  <!-- Missing required sections -->
  <ValiditaOfferta>
    <DATA_INIZIO>01/01/2024</DATA_INIZIO> <!-- Wrong date format -->
    <DATA_FINE>31/12/2024</DATA_FINE>
  </ValiditaOfferta>
  <MetodoPagamento>
    <MODALITA_PAGAMENTO>01</MODALITA_PAGAMENTO>
  </MetodoPagamento>
</Offerta>`;

const malformedXML = `<?xml version="1.0" encoding="UTF-8"?>
<Offerta>
  <IdentificativiOfferta>
    <PIVA_UTENTE>12345678901</PIVA_UTENTE>
    <COD_OFFERTA>TEST-OFFER-001
  </IdentificativiOfferta>`;

export function runTests() {
  console.log("🧪 Running XML Validation Tests\n");

  // Test 1: Fast structure validation
  console.log("Test 1: Fast XML Structure Validation");
  console.log("Valid XML structure:", fastValidator.checkStructure(validXML));
  console.log("Invalid XML structure:", fastValidator.checkStructure(malformedXML));
  const structureErrors = fastValidator.getStructureErrors(malformedXML);
  console.log("Structure errors:", structureErrors);
  console.log("");

  // Test 2: Required elements check
  console.log("Test 2: Required Elements Check");
  const missingElements = fastValidator.checkRequiredElements(invalidXML);
  console.log("Missing required elements:", missingElements);
  console.log("");

  // Test 3: Field validation
  console.log("Test 3: Field Validation");
  const fieldErrors = fastValidator.validateFields(invalidXML);
  console.log("Field validation errors:");
  fieldErrors.forEach(err => {
    console.log(`  - ${err.field}: ${err.error} (value: "${err.value}")`);
  });
  console.log("");

  // Test 4: Full XSD validation
  console.log("Test 4: Full XSD Validation");
  const validator = getDefaultValidator();
  
  console.log("\nValidating valid XML:");
  const validResult = validator.validateXML(validXML);
  console.log("Valid:", validResult.valid);
  console.log("Errors:", validResult.errors.length);
  
  console.log("\nValidating invalid XML:");
  const invalidResult = validator.validateXML(invalidXML);
  console.log("Valid:", invalidResult.valid);
  console.log("Errors:", invalidResult.errors.length);
  
  // Enhance and display errors
  const enhancedErrors = enhanceXSDErrors(invalidResult.errors);
  console.log("\nEnhanced errors:");
  enhancedErrors.forEach((error, index) => {
    console.log(`\nError ${index + 1}:`);
    console.log(formatErrorForDisplay(error));
  });

  // Test 5: Schema info
  console.log("\nTest 5: Schema Information");
  const schemaInfo = validator.getSchemaInfo();
  console.log("Schema loaded:", schemaInfo.loaded);
  console.log("Schema path:", schemaInfo.path);

  console.log("\n✅ All tests completed!");
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
} 