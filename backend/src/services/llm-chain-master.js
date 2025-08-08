// 🤖 FlowForge LLM Chain Master
// AI-powered automation assistant with Firecrawl knowledge base

import OpenAI from 'openai';
import FirecrawlKnowledgeBase from './firecrawl-knowledge-base.js';

class LLMChainMaster {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
    });

    this.knowledgeBase = new FirecrawlKnowledgeBase();

    this.systemPrompts = {
      automation_expert: `You are FlowForge AI, an expert automation consultant with deep knowledge of n8n, Node-RED, Zapier, and workflow automation.

Your expertise includes:
- Creating efficient automation workflows
- Recommending the best nodes for specific tasks
- Debugging flow execution issues
- Optimizing performance and reliability
- Following automation best practices

Always provide:
1. Clear, actionable advice
2. Code examples when relevant
3. Alternative approaches
4. Potential pitfalls to avoid
5. Links to relevant documentation when available

Use the provided knowledge base context to give accurate, up-to-date information.`,

      node_designer: `You are a FlowForge Node Designer AI. Your role is to help users create custom nodes for their automation workflows.

You specialize in:
- Node architecture and design patterns
- Input/output specifications
- Error handling and validation
- Performance optimization
- Integration patterns

Provide detailed technical specifications including:
- Node configuration schema
- Input/output types
- Code implementation
- Testing strategies
- Documentation templates`,

      flow_architect: `You are a FlowForge Flow Architect. You design complete automation workflows from high-level requirements.

Your responsibilities:
- Analyzing business requirements
- Designing scalable flow architectures
- Selecting optimal node combinations
- Planning error handling strategies
- Ensuring maintainability

Always deliver:
- Complete workflow diagrams (text format)
- Node-by-node explanations
- Configuration details
- Testing recommendations
- Maintenance guidelines`,
    };
  }

  async processQuery(userMessage, context = 'automation_expert', conversationHistory = []) {
    try {
      // Get relevant knowledge base context
      const knowledgeContext = await this.knowledgeBase.getLLMContext(userMessage);

      // Build conversation with context
      const messages = [
        {
          role: 'system',
          content: `${this.systemPrompts[context]}

### Knowledge Base Context:
${knowledgeContext.context}

Current date: ${new Date().toISOString().split('T')[0]}
Platform: FlowForge Visual Automation`,
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage,
        },
      ];

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: 1500,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      });

      return {
        success: true,
        response: response.choices[0].message.content,
        sources: knowledgeContext.sources,
        tokens_used: response.usage.total_tokens,
        context_used: context,
      };
    } catch (error) {
      console.error('LLM Chain error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackResponse(userMessage, context),
      };
    }
  }

  async generateNodeSuggestions(flowDescription, existingNodes = []) {
    const prompt = `Based on this flow description: "${flowDescription}"

Existing nodes: ${existingNodes.join(', ') || 'None'}

Suggest 3-5 additional nodes that would enhance this workflow. For each node:
1. Node name and category
2. Purpose in the flow
3. Configuration highlights
4. Connection recommendations

Format as JSON array of node objects.`;

    const response = await this.processQuery(prompt, 'node_designer');

    try {
      // Extract JSON from response
      const jsonMatch = response.response.match(/\\[.*\\]/s);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      return this.parseNodeSuggestionsFromText(response.response);
    }
  }

  async optimizeFlow(flowData) {
    const prompt = `Analyze this automation flow for optimization opportunities:

Flow: ${JSON.stringify(flowData, null, 2)}

Provide optimization recommendations for:
1. Performance improvements
2. Error handling enhancements
3. Maintainability upgrades
4. Security considerations
5. Cost optimization

Include specific node configurations and flow structure changes.`;

    return await this.processQuery(prompt, 'flow_architect');
  }

  async debugFlowIssue(flowData, errorDescription) {
    const prompt = `Debug this automation flow issue:

Flow Configuration: ${JSON.stringify(flowData, null, 2)}

Error/Issue: ${errorDescription}

Provide:
1. Root cause analysis
2. Step-by-step debugging guide
3. Specific fixes to implement
4. Prevention strategies
5. Testing recommendations`;

    return await this.processQuery(prompt, 'automation_expert');
  }

  async explainNode(nodeType, userQuestion) {
    const prompt = `Explain the ${nodeType} node in FlowForge automation:

User question: ${userQuestion}

Provide comprehensive explanation including:
1. Purpose and use cases
2. Configuration options
3. Input/output formats
4. Common patterns
5. Best practices
6. Example implementations`;

    return await this.processQuery(prompt, 'automation_expert');
  }

  async generateFlowFromDescription(description, requirements = {}) {
    const prompt = `Create a complete automation flow based on this description:

Description: ${description}

Requirements: ${JSON.stringify(requirements, null, 2)}

Generate:
1. Complete flow structure (JSON format)
2. Node configurations
3. Connection mappings
4. Variable definitions
5. Error handling setup
6. Testing strategy`;

    return await this.processQuery(prompt, 'flow_architect');
  }

  parseNodeSuggestionsFromText(text) {
    // Fallback parser for when JSON extraction fails
    const nodes = [];
    const lines = text.split('\\n');

    let currentNode = {};

    for (const line of lines) {
      if (line.includes('Node:') || line.includes('name:')) {
        if (currentNode.name) nodes.push(currentNode);
        currentNode = { name: line.split(':')[1]?.trim() };
      } else if (line.includes('Category:')) {
        currentNode.category = line.split(':')[1]?.trim();
      } else if (line.includes('Purpose:')) {
        currentNode.purpose = line.split(':')[1]?.trim();
      }
    }

    if (currentNode.name) nodes.push(currentNode);
    return nodes;
  }

  getFallbackResponse(userMessage, context) {
    const fallbacks = {
      automation_expert:
        "I apologize, but I'm currently experiencing technical difficulties. However, I can suggest checking the FlowForge documentation or exploring similar workflows in our templates gallery.",
      node_designer:
        "I'm temporarily unable to access my knowledge base. Try starting with basic nodes like Manual Trigger, HTTP Request, and Set Variable for most workflows.",
      flow_architect:
        "I'm having connectivity issues. Consider breaking down your workflow into smaller, testable components and building incrementally.",
    };

    return (
      fallbacks[context] ||
      "I'm currently experiencing technical difficulties. Please try again in a moment."
    );
  }

  // Conversation management
  async startConversation(initialMessage, context = 'automation_expert') {
    const conversationId = this.generateConversationId();
    const response = await this.processQuery(initialMessage, context);

    return {
      conversationId,
      ...response,
    };
  }

  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default LLMChainMaster;
