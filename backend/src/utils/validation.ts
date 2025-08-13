/**
 * Validation schemas for API endpoints using Joi
 * Provides consistent validation across all routes
 */

import Joi from 'joi';

// Suggest endpoint validation
export const suggestQuerySchema = Joi.object({
  prefix: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Prefix must be at least 1 character',
      'string.max': 'Prefix cannot exceed 100 characters',
      'any.required': 'Prefix is required'
    }),
  
  k: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .messages({
      'number.base': 'k must be a number',
      'number.integer': 'k must be an integer',
      'number.min': 'k must be at least 1',
      'number.max': 'k cannot exceed 50'
    }),
  
  category: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Category cannot exceed 50 characters'
    })
});

// Select endpoint validation
export const selectBodySchema = Joi.object({
  word: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Word cannot be empty',
      'string.min': 'Word must be at least 1 character',
      'string.max': 'Word cannot exceed 255 characters',
      'any.required': 'Word is required'
    }),
  
  prefix: Joi.string()
    .min(0)
    .max(100)
    .required()
    .messages({
      'string.max': 'Prefix cannot exceed 100 characters',
      'any.required': 'Prefix is required'
    }),
  
  user_id: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'User ID cannot exceed 100 characters'
    })
});

// Insert endpoint validation
export const insertBodySchema = Joi.object({
  word: Joi.string()
    .min(1)
    .max(255)
    .required()
    .pattern(/^[a-zA-Z0-9\s\-_']+$/)
    .messages({
      'string.empty': 'Word cannot be empty',
      'string.min': 'Word must be at least 1 character',
      'string.max': 'Word cannot exceed 255 characters',
      'string.pattern.base': 'Word contains invalid characters',
      'any.required': 'Word is required'
    }),
  
  freq: Joi.number()
    .integer()
    .min(1)
    .max(1000000)
    .default(1)
    .messages({
      'number.base': 'Frequency must be a number',
      'number.integer': 'Frequency must be an integer',
      'number.min': 'Frequency must be at least 1',
      'number.max': 'Frequency cannot exceed 1,000,000'
    }),
  
  category: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Category cannot exceed 100 characters'
    }),
  
  synonyms: Joi.array()
    .items(Joi.string().max(255))
    .max(20)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 20 synonyms',
      'string.max': 'Each synonym cannot exceed 255 characters'
    }),
  
  metadata: Joi.object()
    .optional()
    .messages({
      'object.base': 'Metadata must be an object'
    }),
  
  user_id: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'User ID cannot exceed 100 characters'
    })
});

// Analytics query validation
export const analyticsQuerySchema = Joi.object({
  days: Joi.number()
    .integer()
    .min(1)
    .max(365)
    .default(7)
    .messages({
      'number.base': 'Days must be a number',
      'number.integer': 'Days must be an integer',
      'number.min': 'Days must be at least 1',
      'number.max': 'Days cannot exceed 365'
    })
});

// Export Trie query validation
export const exportQuerySchema = Joi.object({
  format: Joi.string()
    .valid('json')
    .default('json')
    .messages({
      'any.only': 'Format must be json'
    }),
  
  include_metadata: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'include_metadata must be a boolean'
    })
});

// Common validation helpers
export const validatePositiveInteger = (value: any, fieldName: string) => {
  const schema = Joi.number().integer().min(1).required();
  const { error } = schema.validate(value);
  
  if (error) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  
  return value;
};

export const validateStringLength = (value: any, fieldName: string, maxLength: number = 255) => {
  const schema = Joi.string().max(maxLength).required();
  const { error } = schema.validate(value);
  
  if (error) {
    throw new Error(`${fieldName} cannot exceed ${maxLength} characters`);
  }
  
  return value;
};

// Rate limiting validation
export const rateLimitSchema = Joi.object({
  windowMs: Joi.number()
    .integer()
    .min(1000)
    .max(3600000)
    .default(900000)
    .messages({
      'number.base': 'Window must be a number',
      'number.integer': 'Window must be an integer',
      'number.min': 'Window must be at least 1000ms (1 second)',
      'number.max': 'Window cannot exceed 3600000ms (1 hour)'
    }),
  
  max: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .default(100)
    .messages({
      'number.base': 'Max requests must be a number',
      'number.integer': 'Max requests must be an integer',
      'number.min': 'Max requests must be at least 1',
      'number.max': 'Max requests cannot exceed 10,000'
    })
});
