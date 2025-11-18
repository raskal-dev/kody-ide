export type AIService = 'openrouter' | 'openai' | 'anthropic' | 'custom';

export interface AIConfig {
  service: AIService;
  openrouter?: {
    apiKey: string;
    model: string;
  };
  openai?: {
    apiKey: string;
    model: string;
  };
  anthropic?: {
    apiKey: string;
    model: string;
  };
  custom?: {
    endpoint: string;
    apiKey: string;
  };
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ProjectAnalysis {
  structure: FileStructure;
  languages: string[];
  frameworks: string[];
  dependencies: string[];
  summary: string;
}

export interface FileStructure {
  files: string[];
  directories: string[];
  rootFiles: string[];
}

