// 🧠 AI Node Assistant - Ollama Integration
// Intelligent node configuration and optimization using local AI

import BaseNode from '../base/BaseNode.js';

class AINodeAssistant {
  constructor(config = {}) {
    this.ollamaUrl = config.ollamaUrl || 'http://localhost:11434';
    this.model = config.model || 'llama2';
    this.enabled = config.enabled !== false;
  }

  // 🧠 Analyze API endpoint and suggest configuration
  async analyzeEndpoint(url, description = '') {
    if (!this.enabled) return null;

    try {
      const prompt = this.buildAnalysisPrompt(url, description);
      const response = await this.queryOllama(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.warn('🧠 AI Assistant unavailable:', error.message);
      return this.getFallbackSuggestions(url, description);
    }
  }

  // 🔍 Build analysis prompt for AI
  buildAnalysisPrompt(url, description) {
    return `
Analyze this API endpoint and provide HTTP request configuration:

URL: ${url}
Description: ${description}

Please suggest:
1. HTTP method (GET, POST, PUT, DELETE, etc.)
2. Required headers
3. Authentication type if apparent
4. Expected response format
5. Common parameters or body structure
6. Rate limiting considerations

Respond in JSON format:
{
  "method": "GET|POST|PUT|DELETE|PATCH",
  "headers": {"key": "value"},
  "authType": "none|bearer|basic|api-key",
  "responseFormat": "json|xml|text",
  "bodyStructure": {},
  "rateLimit": "requests per minute",
  "confidence": 0.0-1.0
}
    `.trim();
  }

  // 🤖 Query Ollama API
  async queryOllama(prompt) {
    const response = await fetch(`${this.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 500
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }

  // 📋 Parse AI response
  parseAIResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: parse text response
      return this.parseTextResponse(response);
    } catch (error) {
      console.warn('🧠 Failed to parse AI response:', error.message);
      return null;
    }
  }

  // 📝 Parse text response as fallback
  parseTextResponse(response) {
    const suggestions = {
      method: 'GET',
      headers: {},
      authType: 'none',
      responseFormat: 'json',
      confidence: 0.5
    };

    const text = response.toLowerCase();

    // Detect method
    if (text.includes('post') || text.includes('create') || text.includes('submit')) {
      suggestions.method = 'POST';
    } else if (text.includes('put') || text.includes('update') || text.includes('replace')) {
      suggestions.method = 'PUT';
    } else if (text.includes('delete') || text.includes('remove')) {
      suggestions.method = 'DELETE';
    }

    // Detect auth type
    if (text.includes('bearer') || text.includes('token')) {
      suggestions.authType = 'bearer';
    } else if (text.includes('api key') || text.includes('api-key')) {
      suggestions.authType = 'api-key';
    } else if (text.includes('basic auth')) {
      suggestions.authType = 'basic';
    }

    // Detect response format
    if (text.includes('xml')) {
      suggestions.responseFormat = 'xml';
    } else if (text.includes('text') || text.includes('plain')) {
      suggestions.responseFormat = 'text';
    }

    return suggestions;
  }

  // 🎯 Get fallback suggestions without AI
  getFallbackSuggestions(url, description) {
    const suggestions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      authType: 'none',
      responseFormat: 'json',
      confidence: 0.3
    };

    const urlLower = url.toLowerCase();
    const descLower = description.toLowerCase();

    // URL-based detection
    if (urlLower.includes('github.com/api') || urlLower.includes('api.github.com')) {
      suggestions.headers['Accept'] = 'application/vnd.github.v3+json';
      suggestions.authType = 'bearer';
      suggestions.confidence = 0.8;
    }

    if (urlLower.includes('slack.com/api')) {
      suggestions.authType = 'bearer';
      suggestions.confidence = 0.8;
    }

    if (urlLower.includes('googleapis.com')) {
      suggestions.authType = 'bearer';
      suggestions.confidence = 0.8;
    }

    // Description-based detection
    if (descLower.includes('create') || descLower.includes('post') || descLower.includes('add')) {
      suggestions.method = 'POST';
    }

    if (descLower.includes('update') || descLower.includes('edit') || descLower.includes('modify')) {
      suggestions.method = 'PUT';
    }

    if (descLower.includes('delete') || descLower.includes('remove')) {
      suggestions.method = 'DELETE';
    }

    return suggestions;
  }

  // 🔧 Apply suggestions to node properties
  applySuggestions(nodeProperties, suggestions) {
    if (!suggestions) return nodeProperties;

    const updated = { ...nodeProperties };

    // Apply method
    if (suggestions.method && suggestions.confidence > 0.5) {
      updated.method = suggestions.method;
    }

    // Apply headers
    if (suggestions.headers) {
      updated.headers = { ...updated.headers, ...suggestions.headers };
    }

    // Apply authentication
    if (suggestions.authType && suggestions.authType !== 'none' && suggestions.confidence > 0.6) {
      updated.authentication = suggestions.authType;
    }

    // Apply response format
    if (suggestions.responseFormat) {
      updated.responseFormat = suggestions.responseFormat;
    }

    return updated;
  }

  // 🎨 Generate configuration template
  async generateTemplate(apiDescription) {
    if (!this.enabled) return null;

    try {
      const prompt = `
Create a complete HTTP request template for: ${apiDescription}

Include:
- Complete URL with placeholders
- All necessary headers
- Authentication setup
- Request body structure (if applicable)
- Expected response structure

Respond in JSON format with a complete node configuration.
      `.trim();

      const response = await this.queryOllama(prompt);
      return this.parseTemplateResponse(response);
    } catch (error) {
      console.warn('🧠 Template generation failed:', error.message);
      return null;
    }
  }

  parseTemplateResponse(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (error) {
      return null;
    }
  }
}

export default AINodeAssistant;
