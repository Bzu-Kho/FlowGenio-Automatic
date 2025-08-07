// 💾 HTTP Request Node
// Makes HTTP requests to external APIs

import BaseNode from '../base/BaseNode.js';

class HttpRequest extends BaseNode {
  constructor(config = {}) {
    super('HttpRequest', {
      ...config,
      category: 'data',
      icon: 'globe',
      description: 'Send HTTP requests to external APIs'
    });
  }

  defineInputs() {
    return [
      {
        name: 'input',
        type: 'object',
        required: false,
        description: 'Optional data to include in request'
      }
    ];
  }

  defineOutputs() {
    return [
      {
        name: 'output',
        type: 'object',
        description: 'HTTP response data'
      },
      {
        name: 'error',
        type: 'object',
        description: 'Error information if request fails'
      }
    ];
  }

  defineProperties() {
    return {
      url: {
        type: 'string',
        displayName: 'URL',
        description: 'Target URL for the request',
        required: true,
        placeholder: 'https://api.example.com/data'
      },
      method: {
        type: 'select',
        displayName: 'Method',
        description: 'HTTP method',
        default: 'GET',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' },
          { value: 'PATCH', label: 'PATCH' }
        ]
      },
      headers: {
        type: 'object',
        displayName: 'Headers',
        description: 'Request headers',
        default: {
          'Content-Type': 'application/json'
        }
      },
      body: {
        type: 'object',
        displayName: 'Body',
        description: 'Request body (for POST, PUT, PATCH)',
        default: {}
      },
      timeout: {
        type: 'number',
        displayName: 'Timeout (ms)',
        description: 'Request timeout in milliseconds',
        default: 30000
      },
      authentication: {
        type: 'select',
        displayName: 'Authentication',
        description: 'Authentication type',
        default: 'none',
        options: [
          { value: 'none', label: 'None' },
          { value: 'basic', label: 'Basic Auth' },
          { value: 'bearer', label: 'Bearer Token' },
          { value: 'api-key', label: 'API Key' }
        ]
      }
    };
  }

  async execute(context) {
    try {
      const inputData = context.getInputData('input') || {};
      const url = this.getProperty('url');
      const method = this.getProperty('method', 'GET');
      const headers = this.getProperty('headers', {});
      const body = this.getProperty('body', {});
      const timeout = this.getProperty('timeout', 30000);
      const auth = this.getProperty('authentication', 'none');

      if (!url) {
        throw new Error('URL is required for HTTP request');
      }

      // Build request options
      const requestOptions = {
        method,
        headers: { ...headers },
        signal: AbortSignal.timeout(timeout)
      };

      // Add authentication
      await this.addAuthentication(requestOptions, auth);

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const requestBody = { ...body, ...inputData };
        if (headers['Content-Type']?.includes('application/json')) {
          requestOptions.body = JSON.stringify(requestBody);
        } else {
          requestOptions.body = requestBody;
        }
      }

      this.log('info', `Making ${method} request to ${url}`);

      // Make the request
      const response = await fetch(url, requestOptions);
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      const result = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        url: response.url,
        timestamp: new Date().toISOString()
      };

      if (!response.ok) {
        this.log('warn', `HTTP request failed with status ${response.status}`);
        return {
          error: {
            ...result,
            error: `HTTP ${response.status}: ${response.statusText}`
          }
        };
      }

      this.log('info', `HTTP request successful (${response.status})`);
      return { output: result };

    } catch (error) {
      this.log('error', 'HTTP request failed', { error: error.message });
      
      if (error.name === 'TimeoutError') {
        throw this.createError('Request timeout exceeded', 'TIMEOUT_ERROR');
      }
      
      throw this.createError(`HTTP request failed: ${error.message}`, 'REQUEST_ERROR');
    }
  }

  async addAuthentication(requestOptions, authType) {
    switch (authType) {
      case 'basic':
        const username = this.getProperty('username', '');
        const password = this.getProperty('password', '');
        const credentials = btoa(`${username}:${password}`);
        requestOptions.headers['Authorization'] = `Basic ${credentials}`;
        break;
        
      case 'bearer':
        const token = this.getProperty('token', '');
        requestOptions.headers['Authorization'] = `Bearer ${token}`;
        break;
        
      case 'api-key':
        const apiKey = this.getProperty('apiKey', '');
        const apiKeyHeader = this.getProperty('apiKeyHeader', 'X-API-Key');
        requestOptions.headers[apiKeyHeader] = apiKey;
        break;
    }
  }
}

export default HttpRequest;
