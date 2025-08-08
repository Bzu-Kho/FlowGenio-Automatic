// 🌐 HTTP Request Node - Professional Edition
// Advanced HTTP client with AI assistance and extensive configuration options

import BaseNode from '../base/BaseNode.js';

class HttpRequest extends BaseNode {
  constructor(config = {}) {
    super('HttpRequest', {
      ...config,
      category: 'data',
      icon: 'globe',
      description: 'Professional HTTP client with AI assistance and advanced features',
      version: '2.0.0'
    });
  }

  defineInputs() {
    return [
      {
        name: 'trigger',
        type: 'any',
        required: false,
        description: 'Trigger input to execute the request'
      },
      {
        name: 'url',
        type: 'string',
        required: false,
        description: 'Dynamic URL override'
      },
      {
        name: 'body',
        type: 'object',
        required: false,
        description: 'Dynamic request body'
      },
      {
        name: 'headers',
        type: 'object',
        required: false,
        description: 'Dynamic headers override'
      }
    ];
  }

  defineOutputs() {
    return [
      {
        name: 'response',
        type: 'object',
        description: 'Complete HTTP response'
      },
      {
        name: 'data',
        type: 'any',
        description: 'Response body data'
      },
      {
        name: 'headers',
        type: 'object',
        description: 'Response headers'
      },
      {
        name: 'status',
        type: 'object',
        description: 'Status information'
      },
      {
        name: 'error',
        type: 'object',
        description: 'Error details if request fails'
      }
    ];
  }

  defineProperties() {
    return {
      // 🔗 URL Configuration
      url: {
        type: 'string',
        displayName: 'URL',
        description: 'Target URL for the request',
        required: true,
        placeholder: 'https://api.example.com/data',
        category: 'endpoint'
      },
      
      // 🔧 HTTP Method
      method: {
        type: 'select',
        displayName: 'HTTP Method',
        description: 'HTTP request method',
        default: 'GET',
        category: 'endpoint',
        options: [
          { value: 'GET', label: 'GET - Retrieve data' },
          { value: 'POST', label: 'POST - Create/Submit data' },
          { value: 'PUT', label: 'PUT - Update/Replace data' },
          { value: 'PATCH', label: 'PATCH - Partial update' },
          { value: 'DELETE', label: 'DELETE - Remove data' },
          { value: 'HEAD', label: 'HEAD - Headers only' },
          { value: 'OPTIONS', label: 'OPTIONS - Available methods' }
        ]
      },

      // 📋 Headers Configuration
      headers: {
        type: 'keyvalue',
        displayName: 'Request Headers',
        description: 'Custom HTTP headers',
        category: 'headers',
        default: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'User-Agent', value: 'FlowForge/2.0' }
        ],
        placeholder: { key: 'Header-Name', value: 'Header-Value' }
      },

      // 🔐 Authentication
      authentication: {
        type: 'select',
        displayName: 'Authentication',
        description: 'Authentication method',
        default: 'none',
        category: 'auth',
        options: [
          { value: 'none', label: 'None' },
          { value: 'basic', label: 'Basic Authentication' },
          { value: 'bearer', label: 'Bearer Token' },
          { value: 'api-key', label: 'API Key (Header)' },
          { value: 'api-key-query', label: 'API Key (Query Parameter)' },
          { value: 'oauth2', label: 'OAuth 2.0' },
          { value: 'custom', label: 'Custom Authentication' }
        ]
      },

      // 🔑 Auth Details
      authDetails: {
        type: 'object',
        displayName: 'Authentication Details',
        description: 'Authentication configuration',
        category: 'auth',
        conditional: { field: 'authentication', value: ['basic', 'bearer', 'api-key', 'api-key-query', 'oauth2'] },
        properties: {
          username: { type: 'string', label: 'Username' },
          password: { type: 'password', label: 'Password' },
          token: { type: 'password', label: 'Token/API Key' },
          headerName: { type: 'string', label: 'Header Name', default: 'X-API-Key' },
          paramName: { type: 'string', label: 'Parameter Name', default: 'api_key' }
        }
      },

      // 📦 Request Body
      bodyType: {
        type: 'select',
        displayName: 'Body Type',
        description: 'Type of request body',
        default: 'json',
        category: 'body',
        conditional: { field: 'method', value: ['POST', 'PUT', 'PATCH'] },
        options: [
          { value: 'json', label: 'JSON' },
          { value: 'form', label: 'Form Data' },
          { value: 'form-urlencoded', label: 'URL Encoded' },
          { value: 'raw', label: 'Raw Text' },
          { value: 'binary', label: 'Binary' },
          { value: 'multipart', label: 'Multipart Form' }
        ]
      },

      body: {
        type: 'json',
        displayName: 'Request Body',
        description: 'Request payload',
        category: 'body',
        conditional: { field: 'bodyType', value: ['json', 'form', 'form-urlencoded'] },
        default: {}
      },

      rawBody: {
        type: 'text',
        displayName: 'Raw Body',
        description: 'Raw request body',
        category: 'body',
        conditional: { field: 'bodyType', value: ['raw'] },
        multiline: true
      },

      // ⚙️ Advanced Options
      timeout: {
        type: 'number',
        displayName: 'Timeout (ms)',
        description: 'Request timeout in milliseconds',
        default: 30000,
        min: 1000,
        max: 300000,
        category: 'advanced'
      },

      retries: {
        type: 'number',
        displayName: 'Retry Attempts',
        description: 'Number of retry attempts on failure',
        default: 0,
        min: 0,
        max: 5,
        category: 'advanced'
      },

      retryDelay: {
        type: 'number',
        displayName: 'Retry Delay (ms)',
        description: 'Delay between retry attempts',
        default: 1000,
        min: 100,
        max: 10000,
        category: 'advanced',
        conditional: { field: 'retries', operator: '>', value: 0 }
      },

      followRedirects: {
        type: 'boolean',
        displayName: 'Follow Redirects',
        description: 'Automatically follow HTTP redirects',
        default: true,
        category: 'advanced'
      },

      maxRedirects: {
        type: 'number',
        displayName: 'Max Redirects',
        description: 'Maximum number of redirects to follow',
        default: 5,
        min: 1,
        max: 20,
        category: 'advanced',
        conditional: { field: 'followRedirects', value: true }
      },

      // 🧠 AI Assistant
      aiAssisted: {
        type: 'boolean',
        displayName: 'AI Assistance',
        description: 'Enable AI-powered configuration assistance',
        default: false,
        category: 'ai'
      },

      aiPrompt: {
        type: 'text',
        displayName: 'AI Configuration Prompt',
        description: 'Describe what you want to achieve with this API call',
        category: 'ai',
        conditional: { field: 'aiAssisted', value: true },
        placeholder: 'e.g., "Get user profile from GitHub API using my token"',
        multiline: true
      },

      // 📊 Response Processing
      responseFormat: {
        type: 'select',
        displayName: 'Response Format',
        description: 'Expected response format',
        default: 'auto',
        category: 'response',
        options: [
          { value: 'auto', label: 'Auto Detect' },
          { value: 'json', label: 'JSON' },
          { value: 'text', label: 'Text' },
          { value: 'xml', label: 'XML' },
          { value: 'html', label: 'HTML' },
          { value: 'binary', label: 'Binary' }
        ]
      },

      extractData: {
        type: 'json',
        displayName: 'Data Extraction Rules',
        description: 'JSONPath expressions to extract specific data',
        category: 'response',
        default: {},
        placeholder: { "userId": "$.user.id", "email": "$.user.email" }
      },

      // 🔍 Validation & Error Handling
      validateResponse: {
        type: 'boolean',
        displayName: 'Validate Response',
        description: 'Enable response validation',
        default: false,
        category: 'validation'
      },

      validationRules: {
        type: 'json',
        displayName: 'Validation Rules',
        description: 'Response validation criteria',
        category: 'validation',
        conditional: { field: 'validateResponse', value: true },
        default: {
          statusCodes: [200, 201, 202],
          requiredFields: [],
          maxResponseTime: 10000
        }
      },

      // 🐛 Debug & Logging
      logLevel: {
        type: 'select',
        displayName: 'Log Level',
        description: 'Logging verbosity',
        default: 'info',
        category: 'debug',
        options: [
          { value: 'none', label: 'No Logging' },
          { value: 'error', label: 'Errors Only' },
          { value: 'info', label: 'Info' },
          { value: 'debug', label: 'Debug' },
          { value: 'verbose', label: 'Verbose' }
        ]
      }
    };
  }

  async execute(context) {
    const startTime = Date.now();
    const { inputs, properties } = context;
    
    try {
      // 🧠 AI-Assisted Configuration
      if (properties.aiAssisted && properties.aiPrompt) {
        await this.applyAIConfiguration(properties);
      }

      // 🔗 Build Request Configuration
      const requestConfig = await this.buildRequestConfig(inputs, properties);
      
      // 📊 Log request details
      this.logRequest(requestConfig, properties.logLevel);
      
      // 🚀 Execute Request with Retries
      const response = await this.executeWithRetries(requestConfig, properties);
      
      // ⏱️ Calculate timing
      const responseTime = Date.now() - startTime;
      
      // ✅ Validate Response
      if (properties.validateResponse) {
        await this.validateResponse(response, properties.validationRules);
      }
      
      // 📋 Process Response
      const processedResponse = await this.processResponse(response, properties);
      
      // 📊 Log response details
      this.logResponse(processedResponse, responseTime, properties.logLevel);
      
      return this.createSuccessOutput(processedResponse, responseTime);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logError(error, responseTime, properties.logLevel);
      return this.createErrorOutput(error, responseTime);
    }
  }

  // 🧠 AI Configuration Assistant
  async applyAIConfiguration(properties) {
    // TODO: Implement Ollama integration for AI-assisted configuration
    console.log(`🧠 AI Assistant analyzing: "${properties.aiPrompt}" - HttpRequestPro.js:370`);
    
    // This will be expanded with Ollama integration
    // For now, we'll implement smart defaults based on common patterns
    
    const prompt = properties.aiPrompt.toLowerCase();
    
    // Smart defaults based on AI analysis
    if (prompt.includes('github')) {
      properties.headers = properties.headers || {};
      properties.headers['Accept'] = 'application/vnd.github.v3+json';
      if (!properties.url.includes('api.github.com')) {
        console.log('🧠 AI suggests using GitHub API base URL - HttpRequestPro.js:382');
      }
    }
    
    if (prompt.includes('auth') || prompt.includes('token')) {
      if (properties.authentication === 'none') {
        properties.authentication = 'bearer';
        console.log('🧠 AI suggests using Bearer token authentication - HttpRequestPro.js:389');
      }
    }
    
    if (prompt.includes('post') || prompt.includes('create') || prompt.includes('submit')) {
      properties.method = 'POST';
      console.log('🧠 AI suggests using POST method - HttpRequestPro.js:395');
    }
  }

  // 🔗 Build Request Configuration
  async buildRequestConfig(inputs, properties) {
    const config = {
      method: properties.method || 'GET',
      url: inputs.url || properties.url,
      timeout: properties.timeout || 30000,
      headers: { ...properties.headers, ...inputs.headers },
      maxRedirects: properties.followRedirects ? (properties.maxRedirects || 5) : 0
    };

    // Add authentication
    this.addAuthentication(config, properties);
    
    // Add body for applicable methods
    if (['POST', 'PUT', 'PATCH'].includes(config.method)) {
      config.body = inputs.body || properties.body || properties.rawBody;
      
      // Set appropriate Content-Type based on body type
      if (properties.bodyType === 'form-urlencoded') {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (properties.bodyType === 'multipart') {
        config.headers['Content-Type'] = 'multipart/form-data';
      }
    }

    return config;
  }

  // 🚀 Execute with Retry Logic
  async executeWithRetries(config, properties) {
    const maxRetries = properties.retries || 0;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.makeHttpRequest(config);
        return response;
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          const delay = properties.retryDelay || 1000;
          console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} in ${delay}ms - HttpRequestPro.js:441`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  // 🌐 Make HTTP Request
  async makeHttpRequest(config) {
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
      signal: AbortSignal.timeout(config.timeout)
    });

    const data = await this.parseResponseData(response);
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      ok: response.ok,
      url: response.url,
      redirected: response.redirected
    };
  }

  // 📋 Parse Response Data
  async parseResponseData(response) {
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/')) {
      return await response.text();
    } else {
      return await response.arrayBuffer();
    }
  }

  // ✅ Create Success Output
  createSuccessOutput(response, responseTime) {
    return {
      response: {
        ...response,
        responseTime,
        timestamp: new Date().toISOString()
      },
      data: response.data,
      headers: response.headers,
      status: {
        code: response.status,
        text: response.statusText,
        ok: response.ok,
        responseTime
      }
    };
  }

  // ❌ Create Error Output
  createErrorOutput(error, responseTime) {
    return {
      error: {
        message: error.message,
        type: error.name,
        responseTime,
        timestamp: new Date().toISOString(),
        details: error.cause || error.stack
      }
    };
  }

  // 🔐 Add Authentication
  addAuthentication(config, properties) {
    const { authentication, authDetails } = properties;
    
    switch (authentication) {
      case 'basic':
        const credentials = btoa(`${authDetails.username}:${authDetails.password}`);
        config.headers['Authorization'] = `Basic ${credentials}`;
        break;
        
      case 'bearer':
        config.headers['Authorization'] = `Bearer ${authDetails.token}`;
        break;
        
      case 'api-key':
        const headerName = authDetails.headerName || 'X-API-Key';
        config.headers[headerName] = authDetails.token;
        break;
        
      case 'api-key-query':
        const paramName = authDetails.paramName || 'api_key';
        const url = new URL(config.url);
        url.searchParams.set(paramName, authDetails.token);
        config.url = url.toString();
        break;
    }
  }

  // 📊 Logging Methods
  logRequest(config, logLevel) {
    if (logLevel === 'none') return;
    
    console.log(`🌐 HTTP ${config.method} ${config.url} - HttpRequestPro.js:549`);
    
    if (logLevel === 'debug' || logLevel === 'verbose') {
      console.log('📋 Headers: - HttpRequestPro.js:552', config.headers);
      if (config.body) {
        console.log('📦 Body: - HttpRequestPro.js:554', config.body);
      }
    }
  }

  logResponse(response, responseTime, logLevel) {
    if (logLevel === 'none') return;
    
    console.log(`✅ Response ${response.status} (${responseTime}ms) - HttpRequestPro.js:562`);
    
    if (logLevel === 'debug' || logLevel === 'verbose') {
      console.log('📋 Response Headers: - HttpRequestPro.js:565', response.headers);
      if (logLevel === 'verbose') {
        console.log('📦 Response Data: - HttpRequestPro.js:567', response.data);
      }
    }
  }

  logError(error, responseTime, logLevel) {
    if (logLevel === 'none') return;
    
    console.error(`❌ HTTP Error (${responseTime}ms): - HttpRequestPro.js:575`, error.message);
    
    if (logLevel === 'debug' || logLevel === 'verbose') {
      console.error('🔍 Error Details: - HttpRequestPro.js:578', error);
    }
  }
}

export default HttpRequest;
