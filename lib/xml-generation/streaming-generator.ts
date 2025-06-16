import { createWriteStream, WriteStream } from "fs";
import { create } from "xmlbuilder2";
import { SIIOfferta } from "@/types/sii-generated";
import { XMLGenerator } from "./xml-generator";
import { XMLGenerationError } from "./errors";

export class StreamingXMLGenerator {
  private generator: XMLGenerator;

  constructor() {
    this.generator = new XMLGenerator();
  }

  /**
   * Generate XML for multiple offers using streaming
   */
  async generateLargeXML(
    data: SIIOfferta[],
    outputPath: string
  ): Promise<void> {
    const stream = createWriteStream(outputPath, { encoding: 'utf8' });

    return new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);

      try {
        // Write XML declaration
        stream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
        stream.write('<Offerte>\n');

        // Write each offer
        for (const offer of data) {
          const offerXML = this.generator.generateOfferXML(offer);
          
          // Remove XML declaration from individual offers
          const offerContent = offerXML.replace(/<\?xml[^?]*\?>\n?/, '');
          
          // Indent the offer content
          const indentedContent = offerContent
            .split('\n')
            .map(line => line ? '  ' + line : line)
            .join('\n');
            
          stream.write(indentedContent);
          stream.write('\n');
        }

        // Close root element
        stream.write('</Offerte>\n');
        stream.end();
      } catch (error) {
        stream.destroy();
        reject(new XMLGenerationError(
          "Failed to generate streaming XML",
          "streaming",
          undefined,
          error as Error
        ));
      }
    });
  }

  /**
   * Generate XML for offers in chunks to manage memory usage
   */
  async generateChunkedXML(
    data: SIIOfferta[],
    outputPath: string,
    chunkSize: number = 100
  ): Promise<void> {
    const stream = createWriteStream(outputPath, { encoding: 'utf8' });
    
    return new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);

      const writeChunk = async (chunk: SIIOfferta[]) => {
        for (const offer of chunk) {
          try {
            const offerXML = this.generator.generateOfferXML(offer);
            const offerContent = offerXML.replace(/<\?xml[^?]*\?>\n?/, '');
            
            await new Promise((resolveWrite, rejectWrite) => {
              const canWrite = stream.write(offerContent + '\n');
              
              if (!canWrite) {
                stream.once('drain', resolveWrite);
              } else {
                resolveWrite(undefined);
              }
            });
          } catch (error) {
            throw new XMLGenerationError(
              `Failed to process offer: ${offer.IdentificativiOfferta.COD_OFFERTA}`,
              "chunk-processing",
              undefined,
              error as Error
            );
          }
        }
      };

      (async () => {
        try {
          stream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
          stream.write('<Offerte>\n');

          // Process data in chunks
          for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            await writeChunk(chunk);
          }

          stream.write('</Offerte>\n');
          stream.end();
        } catch (error) {
          stream.destroy();
          reject(error);
        }
      })();
    });
  }

  /**
   * Stream XML directly to a response (useful for API endpoints)
   */
  streamToResponse(
    data: SIIOfferta[],
    responseStream: NodeJS.WritableStream
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      responseStream.on("finish", resolve);
      responseStream.on("error", reject);

      try {
        // Set appropriate headers if it's an HTTP response
        if ('setHeader' in responseStream) {
          (responseStream as any).setHeader('Content-Type', 'application/xml');
          (responseStream as any).setHeader('Content-Disposition', 'attachment; filename="offerte.xml"');
        }

        responseStream.write('<?xml version="1.0" encoding="UTF-8"?>\n');
        responseStream.write('<Offerte>\n');

        for (const offer of data) {
          const offerXML = this.generator.generateOfferXML(offer);
          const offerContent = offerXML.replace(/<\?xml[^?]*\?>\n?/, '');
          responseStream.write(offerContent + '\n');
        }

        responseStream.write('</Offerte>\n');
        responseStream.end();
      } catch (error) {
        if ('destroy' in responseStream) {
          (responseStream as any).destroy();
        }
        reject(new XMLGenerationError(
          "Failed to stream XML to response",
          "response-streaming",
          undefined,
          error as Error
        ));
      }
    });
  }
} 