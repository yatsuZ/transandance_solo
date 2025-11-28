/**
 * Types et schémas communs pour toutes les routes API
 */

// ==================== Schémas de réponses d'erreur ====================

export const errorResponseSchema = {
  type: 'object' as const,
  required: ['success', 'error'],
  properties: {
    success: { type: 'boolean' as const, enum: [false] },
    error: { type: 'string' }
  }
};

export interface ErrorResponse {
  success: false;
  error: string;
}

// ==================== Schémas de réponses de succès ====================

export const successMessageSchema = {
  type: 'object' as const,
  required: ['success', 'message'],
  properties: {
    success: { type: 'boolean' as const, enum: [true] },
    message: { type: 'string' }
  }
};

export interface SuccessMessage {
  success: true;
  message: string;
}

// Type générique pour les réponses de succès avec data
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  count?: number;
}

// ==================== Helpers pour créer des schémas de réponse ====================

export const createSuccessResponseSchema = (dataSchema: any, description: string) => ({
  type: 'object' as const,
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean' as const, enum: [true] },
    data: dataSchema,
    message: { type: 'string' }
  },
  description
});

export const createSuccessArrayResponseSchema = (itemSchema: any, description: string) => ({
  type: 'object' as const,
  required: ['success', 'data', 'count'],
  properties: {
    success: { type: 'boolean' as const, enum: [true] },
    data: { type: 'array', items: itemSchema },
    count: { type: 'integer' },
    message: { type: 'string' }
  },
  description
});
