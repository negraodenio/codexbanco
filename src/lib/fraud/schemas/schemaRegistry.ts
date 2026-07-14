import { DocumentType, FraudSchema } from "../types";
import { schemaDefinitions } from "./definitions";

export class SchemaRegistry {
  constructor(private readonly schemas: FraudSchema[] = schemaDefinitions) {}

  all(): FraudSchema[] {
    return this.schemas;
  }

  findById(schemaId: string): FraudSchema | undefined {
    return this.schemas.find((schema) => schema.schemaId === schemaId);
  }

  activeFor(documentType: DocumentType, country?: string): FraudSchema | undefined {
    return this.schemas.find(
      (schema) =>
        schema.status === "active" &&
        schema.documentType === documentType &&
        (!country || !schema.country || schema.country === country || schema.country === "EU")
    );
  }
}

export const schemaRegistry = new SchemaRegistry();

