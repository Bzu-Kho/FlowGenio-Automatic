// 🔥 FlowForge Firecrawl Knowledge Base System
// Automated knowledge extraction from automation platforms

import FirecrawlApp from "@mendable/firecrawl-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FirecrawlKnowledgeBase {
  constructor() {
    this.firecrawl = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY || "your-firecrawl-api-key"
    });
    this.knowledgeBasePath = path.join(__dirname, "../../data/knowledge-base");
    this.initializeDirectories();
  }

  initializeDirectories() {
    const dirs = [
      "n8n",
      "node-red", 
      "zapier",
      "automation-patterns",
      "processed"
    ];
    
    dirs.forEach(dir => {
      const dirPath = path.join(this.knowledgeBasePath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
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
        
        const crawlResult = await this.firecrawl.crawlUrl(url, {
          formats: ["markdown", "html"],
          includePaths: ["docs/*", "help/*", "workflows/*", "nodes/*"],
          excludePaths: ["api/*", "admin/*", "billing/*"],
          limit: 100,
          allowBackwardLinks: false
        });

        if (crawlResult.success) {
          await this.processAndStore(crawlResult.data, url);
          console.log(`✅ Successfully crawled: ${url}`);
        } else {
          console.log(`❌ Failed to crawl: ${url}`);
        }

        // Rate limiting - be respectful
        await this.sleep(2000);

      } catch (error) {
        console.error(`Error crawling ${url}:`, error.message);
      }
    }

    console.log("�� Knowledge base crawling completed!");
  }

  async processAndStore(data, sourceUrl) {
    const domain = new URL(sourceUrl).hostname;
    let category = "general";

    // Categorize by source
    if (domain.includes("n8n")) category = "n8n";
    else if (domain.includes("nodered")) category = "node-red";
    else if (domain.includes("zapier")) category = "zapier";
    else if (domain.includes("github")) category = "automation-patterns";

    for (const page of data) {
      const fileName = this.sanitizeFileName(page.url);
      const filePath = path.join(this.knowledgeBasePath, category, `${fileName}.json`);
      
      const processedData = {
        url: page.url,
        title: page.metadata?.title || "Unknown",
        content: page.markdown || page.html,
        extractedAt: new Date().toISOString(),
        category,
        sourceUrl,
        keywords: this.extractKeywords(page.markdown || page.html)
      };

      fs.writeFileSync(filePath, JSON.stringify(processedData, null, 2));
    }
  }

  extractKeywords(content) {
    if (!content) return [];
    
    const automationKeywords = [
      "workflow", "node", "trigger", "action", "automation",
      "webhook", "API", "integration", "connector", "flow",
      "condition", "loop", "variable", "function", "execute",
      "schedule", "cron", "event", "data", "transform"
    ];

    const foundKeywords = automationKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );

    return [...new Set(foundKeywords)];
  }

  sanitizeFileName(url) {
    return url
      .replace(/https?:\/\//, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .substring(0, 100);
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Search functionality for LLM context
  searchKnowledge(query, category = null) {
    const results = [];
    const searchDir = category 
      ? path.join(this.knowledgeBasePath, category)
      : this.knowledgeBasePath;

    const searchFiles = (dir) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          searchFiles(fullPath);
        } else if (file.name.endsWith(".json")) {
          try {
            const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
            
            if (this.matchesQuery(data, query)) {
              results.push({
                ...data,
                relevanceScore: this.calculateRelevance(data, query)
              });
            }
          } catch (error) {
            console.error(`Error reading ${fullPath}:`, error.message);
          }
        }
      }
    };

    if (fs.existsSync(searchDir)) {
      searchFiles(searchDir);
    }

    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10); // Top 10 results
  }

  matchesQuery(data, query) {
    const searchText = `${data.title} ${data.content} ${data.keywords.join(" ")}`.toLowerCase();
    const queryTerms = query.toLowerCase().split(" ");
    
    return queryTerms.some(term => searchText.includes(term));
  }

  calculateRelevance(data, query) {
    const searchText = `${data.title} ${data.content}`.toLowerCase();
    const queryTerms = query.toLowerCase().split(" ");
    
    let score = 0;
    
    queryTerms.forEach(term => {
      const titleMatches = (data.title.toLowerCase().match(new RegExp(term, "g")) || []).length * 3;
      const contentMatches = (searchText.match(new RegExp(term, "g")) || []).length;
      const keywordMatches = data.keywords.filter(k => k.toLowerCase().includes(term)).length * 2;
      
      score += titleMatches + contentMatches + keywordMatches;
    });

    return score;
  }

  // Get context for LLM prompts
  async getLLMContext(userQuery, maxTokens = 4000) {
    const relevantKnowledge = this.searchKnowledge(userQuery);
    
    let context = "### FlowForge Knowledge Base Context:\\n\\n";
    let tokenCount = 0;
    
    for (const item of relevantKnowledge) {
      const itemText = `**${item.title}** (${item.category})\\n${item.content.substring(0, 500)}...\\n\\n`;
      
      if (tokenCount + itemText.length < maxTokens) {
        context += itemText;
        tokenCount += itemText.length;
      } else {
        break;
      }
    }

    return {
      context,
      sources: relevantKnowledge.map(item => ({
        title: item.title,
        url: item.url,
        category: item.category
      }))
    };
  }
}

export default FirecrawlKnowledgeBase;
