const FirecrawlApp = require("@mendable/firecrawl-js").default;
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

class FirecrawlKnowledgeBase {
  constructor() {
    this.firecrawl = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY || "test-key"
    });
    
    this.dbPath = path.join(__dirname, "../database/knowledge.db");
    this.db = new sqlite3.Database(this.dbPath);
    this.initDatabase();
  }

  initDatabase() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS knowledge_sources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          url TEXT UNIQUE NOT NULL,
          title TEXT,
          content TEXT,
          metadata TEXT,
          crawled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          source_type TEXT DEFAULT "automation_platform"
        )
      `);
      
      this.db.run(`
        CREATE TABLE IF NOT EXISTS node_patterns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          pattern_name TEXT NOT NULL,
          platform TEXT NOT NULL,
          description TEXT,
          implementation TEXT,
          source_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    });
  }

  async crawlAutomationSources() {
    const sources = [
      // n8n documentation (open source)
      "https://docs.n8n.io/workflows/",
      "https://docs.n8n.io/nodes/",
      "https://docs.n8n.io/workflows/components/",
      
      // Node-RED documentation (open source) 
      "https://nodered.org/docs/user-guide/",
      "https://flows.nodered.org/",
      
      // Zapier public documentation
      "https://zapier.com/help/create/",
      "https://zapier.com/help/manage/",
      
      // Open source automation patterns
      "https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes",
      "https://cookbook.nodered.org/"
    ];

    console.log("🔥 Starting Firecrawl knowledge base scraping...");
    
    for (const url of sources) {
      try {
        console.log(`📖 Crawling: ${url}`);
        
        const crawlResponse = await this.firecrawl.scrapeUrl(url, {
          formats: ["markdown", "html"],
          onlyMainContent: true,
          includeTags: ["h1", "h2", "h3", "h4", "code", "pre"],
          excludeTags: ["nav", "footer", "sidebar"],
          waitFor: 2000
        });

        if (crawlResponse.success) {
          await this.storeKnowledge(url, crawlResponse.data);
          console.log(`✅ Successfully crawled: ${url}`);
        } else {
          console.log(`❌ Failed to crawl: ${url}`);
        }
        
        // Rate limiting - be respectful
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (error) {
        console.error(`❌ Error crawling ${url}:`, error.message);
      }
    }
    
    console.log("🎉 Firecrawl knowledge base scraping completed!");
  }

  async storeKnowledge(url, data) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO knowledge_sources 
         (url, title, content, metadata) VALUES (?, ?, ?, ?)`,
        [
          url,
          data.title || "Automation Documentation", 
          data.markdown || data.html || "",
          JSON.stringify({
            description: data.description,
            ogTitle: data.ogTitle,
            ogDescription: data.ogDescription,
            sourceURL: data.sourceURL,
            statusCode: data.statusCode
          })
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async searchKnowledge(query, limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM knowledge_sources 
         WHERE content LIKE ? OR title LIKE ? 
         ORDER BY crawled_at DESC 
         LIMIT ?`,
        [`%${query}%`, `%${query}%`, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async extractNodePatterns() {
    console.log("🧠 Extracting node patterns from knowledge base...");
    
    const patterns = [
      { name: "HTTP Request", platforms: ["n8n", "zapier", "node-red"] },
      { name: "Webhook Trigger", platforms: ["n8n", "zapier", "node-red"] },
      { name: "Schedule Trigger", platforms: ["n8n", "zapier", "node-red"] },
      { name: "Email Send", platforms: ["n8n", "zapier", "node-red"] },
      { name: "Database Query", platforms: ["n8n", "zapier", "node-red"] },
      { name: "File Operations", platforms: ["n8n", "zapier", "node-red"] },
      { name: "Conditional Logic", platforms: ["n8n", "zapier", "node-red"] },
      { name: "Data Transformation", platforms: ["n8n", "zapier", "node-red"] },
      { name: "API Integration", platforms: ["n8n", "zapier", "node-red"] },
      { name: "Loop Iterator", platforms: ["n8n", "node-red"] }
    ];

    for (const pattern of patterns) {
      for (const platform of pattern.platforms) {
        try {
          const knowledge = await this.searchKnowledge(`${pattern.name} ${platform}`, 3);
          
          if (knowledge.length > 0) {
            const implementation = this.generateImplementation(pattern.name, platform, knowledge);
            
            await this.storeNodePattern(
              pattern.name,
              platform,
              `${pattern.name} implementation for ${platform}`,
              implementation,
              knowledge[0].url
            );
            
            console.log(`✅ Extracted pattern: ${pattern.name} (${platform})`);
          }
        } catch (error) {
          console.error(`❌ Error extracting pattern ${pattern.name}:`, error);
        }
      }
    }
    
    console.log("🎉 Node pattern extraction completed!");
  }

  generateImplementation(patternName, platform, knowledge) {
    // Esta función genera una implementación base usando el conocimiento extraído
    const baseImplementation = {
      name: patternName,
      platform: platform,
      type: this.getNodeType(patternName),
      inputs: this.generateInputs(patternName),
      outputs: this.generateOutputs(patternName),
      properties: this.generateProperties(patternName),
      execution: this.generateExecution(patternName, knowledge)
    };
    
    return JSON.stringify(baseImplementation, null, 2);
  }

  getNodeType(patternName) {
    if (patternName.includes("Trigger")) return "trigger";
    if (patternName.includes("HTTP") || patternName.includes("API")) return "data";
    if (patternName.includes("Logic") || patternName.includes("Loop")) return "logic";
    if (patternName.includes("Email") || patternName.includes("Send")) return "action";
    return "utility";
  }

  generateInputs(patternName) {
    const commonInputs = [{ name: "input", type: "any" }];
    
    if (patternName.includes("Trigger")) return [];
    if (patternName.includes("HTTP")) return [
      { name: "url", type: "string", required: true },
      { name: "method", type: "string", default: "GET" },
      { name: "headers", type: "object" },
      { name: "body", type: "any" }
    ];
    
    return commonInputs;
  }

  generateOutputs(patternName) {
    return [{ name: "output", type: "any" }];
  }

  generateProperties(patternName) {
    if (patternName.includes("HTTP")) {
      return {
        url: { type: "string", displayName: "URL", required: true },
        method: { type: "options", options: ["GET", "POST", "PUT", "DELETE"], default: "GET" },
        authentication: { type: "options", options: ["none", "basic", "oauth2"], default: "none" }
      };
    }
    
    if (patternName.includes("Schedule")) {
      return {
        interval: { type: "string", displayName: "Interval", default: "5m" },
        timezone: { type: "string", displayName: "Timezone", default: "UTC" }
      };
    }
    
    return {};
  }

  generateExecution(patternName, knowledge) {
    // Genera código de ejecución basado en el conocimiento extraído
    let execution = `
      async execute(context) {
        try {
          // Implementation for ${patternName}
          const input = context.getInputData();
          
          // Process based on extracted knowledge
          const result = await this.processNode(input);
          
          return { output: result };
        } catch (error) {
          throw new Error(\`${patternName} execution failed: \${error.message}\`);
        }
      }
    `;
    
    return execution.trim();
  }

  async storeNodePattern(name, platform, description, implementation, sourceUrl) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR REPLACE INTO node_patterns 
         (pattern_name, platform, description, implementation, source_url) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, platform, description, implementation, sourceUrl],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  async getNodePatterns(platform = null) {
    return new Promise((resolve, reject) => {
      const query = platform 
        ? `SELECT * FROM node_patterns WHERE platform = ? ORDER BY pattern_name`
        : `SELECT * FROM node_patterns ORDER BY platform, pattern_name`;
      
      const params = platform ? [platform] : [];
      
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async generateNodeCode(patternName, platform = "flowforge") {
    const patterns = await this.getNodePatterns(platform);
    const pattern = patterns.find(p => p.pattern_name === patternName);
    
    if (!pattern) {
      throw new Error(`Pattern ${patternName} not found for platform ${platform}`);
    }
    
    return pattern.implementation;
  }

  close() {
    this.db.close();
  }
}

module.exports = FirecrawlKnowledgeBase;
