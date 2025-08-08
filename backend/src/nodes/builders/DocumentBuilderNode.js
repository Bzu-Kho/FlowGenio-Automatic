export class DocumentBuilderNode {
  constructor(config = {}) {
    super({
      type: 'document-builder',
      name: 'Document Builder',
      description: 'Specialized AI builder for document processing nodes (PDF, TXT, DOC, MD, etc.)',
      category: 'builders',
      inputs: {
        documentType: {
          type: 'string',
          description: 'Type of document to work with',
          enum: ['pdf', 'txt', 'doc', 'docx', 'md', 'rtf', 'odt'],
        },
        operation: {
          type: 'string',
          description: 'What operation to perform',
          enum: ['create', 'parse', 'convert', 'merge', 'extract', 'format'],
        },
        requirements: {
          type: 'string',
          description: 'Specific requirements for the document operation',
        },
        template: {
          type: 'object',
          description: 'Template or structure for document creation',
          optional: true,
        },
        styling: {
          type: 'object',
          description: 'Styling options (fonts, colors, layout)',
          optional: true,
        },
      },
      outputs: {
        nodeCode: {
          type: 'string',
          description: 'Generated node code for document processing',
        },
        nodeConfig: {
          type: 'object',
          description: 'Configuration for the generated node',
        },
        dependencies: {
          type: 'array',
          description: 'Required npm packages for document processing',
        },
        examples: {
          type: 'array',
          description: 'Usage examples for the generated node',
        },
      },
      ...config,
    });

    this.documentLibraries = {
      pdf: ['pdf-lib', 'puppeteer', 'jspdf', 'pdf2pic'],
      txt: ['fs', 'iconv-lite', 'encoding'],
      doc: ['mammoth', 'docx'],
      docx: ['docx', 'pizzip', 'docxtemplater'],
      md: ['markdown-it', 'marked', 'showdown'],
      rtf: ['rtf-parser', 'rtf.js'],
      odt: ['node-odt2html', 'libreoffice-convert'],
    };

    this.documentTemplates = {
      pdf: {
        creator: this.generatePDFCreator,
        parser: this.generatePDFParser,
        converter: this.generatePDFConverter,
      },
      txt: {
        creator: this.generateTextCreator,
        parser: this.generateTextParser,
        converter: this.generateTextConverter,
      },
      md: {
        creator: this.generateMarkdownCreator,
        parser: this.generateMarkdownParser,
        converter: this.generateMarkdownConverter,
      },
      docx: {
        creator: this.generateDocxCreator,
        parser: this.generateDocxParser,
        converter: this.generateDocxConverter,
      },
    };
  }

  async execute() {
    const { documentType, operation, requirements, template, styling } = this.data;

    try {
      // Analyze requirements and select appropriate libraries
      const libraries = this.selectLibraries(documentType, operation);

      // Generate specialized node code
      const nodeCode = await this.generateDocumentNode(
        documentType,
        operation,
        requirements,
        template,
        styling,
      );

      // Create node configuration
      const nodeConfig = this.createNodeConfig(documentType, operation);

      // Generate usage examples
      const examples = this.generateExamples(documentType, operation);

      return {
        nodeCode,
        nodeConfig,
        dependencies: libraries,
        examples,
      };
    } catch (error) {
      throw new Error(`Document builder failed: ${error.message}`);
    }
  }

  selectLibraries(documentType, operation) {
    const baseLibs = this.documentLibraries[documentType] || [];
    const commonLibs = ['fs', 'path', 'crypto'];

    // Add operation-specific libraries
    const operationLibs = {
      convert: ['sharp', 'imagemin'],
      merge: ['concat-stream'],
      extract: ['cheerio', 'jsdom'],
      format: ['prettier', 'beautify'],
    };

    return [...new Set([...baseLibs, ...commonLibs, ...(operationLibs[operation] || [])])];
  }

  async generateDocumentNode(documentType, operation, requirements, template, styling) {
    const templateMethod = this.documentTemplates[documentType]?.[operation];

    if (templateMethod) {
      return templateMethod.call(this, requirements, template, styling);
    }

    // Fallback to generic generation
    return this.generateGenericDocumentNode(documentType, operation, requirements);
  }

  generatePDFCreator(requirements, template, styling) {
    return `import { BaseNode } from '../BaseNode.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';

export class PDFCreatorNode extends BaseNode {
    constructor(config = {}) {
        super({
            type: 'pdf-creator',
            name: 'PDF Creator',
            description: 'Creates PDF documents with custom content and styling',
            category: 'document',
            inputs: {
                content: { type: 'string', description: 'Content to add to PDF' },
                title: { type: 'string', description: 'Document title', optional: true },
                outputPath: { type: 'string', description: 'Output file path' },
                styling: { type: 'object', description: 'PDF styling options', optional: true }
            },
            outputs: {
                filePath: { type: 'string', description: 'Path to created PDF' },
                fileSize: { type: 'number', description: 'File size in bytes' }
            },
            ...config
        });
    }

    async execute() {
        const { content, title, outputPath, styling = {} } = this.data;
        
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: styling.pageSize || 'A4',
                margin: styling.margin || 50
            });
            
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);
            
            // Add title if provided
            if (title) {
                doc.fontSize(20)
                   .font('Helvetica-Bold')
                   .text(title, { align: 'center' })
                   .moveDown();
            }
            
            // Add content
            doc.fontSize(styling.fontSize || 12)
               .font(styling.font || 'Helvetica')
               .text(content, {
                   align: styling.align || 'left',
                   lineGap: styling.lineGap || 2
               });
            
            doc.end();
            
            stream.on('finish', () => {
                const stats = fs.statSync(outputPath);
                resolve({
                    filePath: outputPath,
                    fileSize: stats.size
                });
            });
            
            stream.on('error', reject);
        });
    }
}`;
  }

  generateMarkdownCreator(requirements, template, styling) {
    return `import { BaseNode } from '../BaseNode.js';
import fs from 'fs/promises';
import marked from 'marked';

export class MarkdownCreatorNode extends BaseNode {
    constructor(config = {}) {
        super({
            type: 'markdown-creator',
            name: 'Markdown Creator',
            description: 'Creates and processes Markdown documents',
            category: 'document',
            inputs: {
                content: { type: 'string', description: 'Raw content or markdown' },
                template: { type: 'string', description: 'Markdown template', optional: true },
                outputFormat: { type: 'string', enum: ['md', 'html'], default: 'md' },
                outputPath: { type: 'string', description: 'Output file path' },
                frontMatter: { type: 'object', description: 'YAML front matter', optional: true }
            },
            outputs: {
                filePath: { type: 'string', description: 'Path to created file' },
                htmlContent: { type: 'string', description: 'HTML version if converted' }
            },
            ...config
        });
    }

    async execute() {
        const { content, template, outputFormat, outputPath, frontMatter } = this.data;
        
        let finalContent = content;
        
        // Add front matter if provided
        if (frontMatter) {
            const yamlFront = Object.entries(frontMatter)
                .map(([key, value]) => \`\${key}: \${value}\`)
                .join('\\n');
            finalContent = \`---\\n\${yamlFront}\\n---\\n\\n\${content}\`;
        }
        
        // Apply template if provided
        if (template) {
            finalContent = template.replace('{{CONTENT}}', finalContent);
        }
        
        let htmlContent = null;
        
        if (outputFormat === 'html') {
            htmlContent = marked.parse(finalContent);
            await fs.writeFile(outputPath, htmlContent);
        } else {
            await fs.writeFile(outputPath, finalContent);
        }
        
        return {
            filePath: outputPath,
            htmlContent
        };
    }
}`;
  }

  generateDocxCreator(requirements, template, styling) {
    return `import { BaseNode } from '../BaseNode.js';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import fs from 'fs';

export class DocxCreatorNode extends BaseNode {
    constructor(config = {}) {
        super({
            type: 'docx-creator',
            name: 'DOCX Creator',
            description: 'Creates Microsoft Word documents',
            category: 'document',
            inputs: {
                content: { type: 'string', description: 'Document content' },
                title: { type: 'string', description: 'Document title', optional: true },
                outputPath: { type: 'string', description: 'Output file path' },
                formatting: { type: 'object', description: 'Text formatting options', optional: true }
            },
            outputs: {
                filePath: { type: 'string', description: 'Path to created DOCX file' },
                fileSize: { type: 'number', description: 'File size in bytes' }
            },
            ...config
        });
    }

    async execute() {
        const { content, title, outputPath, formatting = {} } = this.data;
        
        const paragraphs = [];
        
        // Add title if provided
        if (title) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: title,
                            bold: true,
                            size: 32
                        })
                    ],
                    heading: 'Title'
                })
            );
        }
        
        // Split content into paragraphs
        const contentParagraphs = content.split('\\n\\n');
        
        contentParagraphs.forEach(para => {
            if (para.trim()) {
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: para.trim(),
                                size: formatting.fontSize || 24,
                                font: formatting.font || 'Calibri'
                            })
                        ]
                    })
                );
            }
        });
        
        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs
            }]
        });
        
        const buffer = await Packer.toBuffer(doc);
        await fs.promises.writeFile(outputPath, buffer);
        
        const stats = await fs.promises.stat(outputPath);
        
        return {
            filePath: outputPath,
            fileSize: stats.size
        };
    }
}`;
  }

  generateGenericDocumentNode(documentType, operation, requirements) {
    return `import { BaseNode } from '../BaseNode.js';

export class ${this.capitalizeFirst(documentType)}${this.capitalizeFirst(operation)}Node extends BaseNode {
    constructor(config = {}) {
        super({
            type: '${documentType}-${operation}',
            name: '${this.capitalizeFirst(documentType)} ${this.capitalizeFirst(operation)}',
            description: 'Generated node for ${documentType} ${operation} operations',
            category: 'document',
            inputs: {
                input: { type: 'any', description: 'Input data for processing' }
            },
            outputs: {
                result: { type: 'any', description: 'Processing result' }
            },
            ...config
        });
    }

    async execute() {
        const { input } = this.data;
        
        // TODO: Implement ${documentType} ${operation} logic
        // Requirements: ${requirements}
        
        return {
            result: \`Processed \${documentType} with \${operation}\`
        };
    }
}`;
  }

  createNodeConfig(documentType, operation) {
    return {
      type: `${documentType}-${operation}`,
      category: 'document',
      icon: this.getDocumentIcon(documentType),
      color: this.getDocumentColor(documentType),
      tags: ['document', documentType, operation],
      version: '1.0.0',
    };
  }

  generateExamples(documentType, operation) {
    return [
      {
        name: `Basic ${documentType} ${operation}`,
        description: `Simple example of ${documentType} ${operation}`,
        config: {
          input: `Sample input for ${documentType} ${operation}`,
        },
      },
    ];
  }

  getDocumentIcon(documentType) {
    const icons = {
      pdf: '📄',
      txt: '📝',
      md: '📋',
      doc: '📄',
      docx: '📄',
      rtf: '📄',
      odt: '📄',
    };
    return icons[documentType] || '📄';
  }

  getDocumentColor(documentType) {
    const colors = {
      pdf: '#FF6B6B',
      txt: '#4ECDC4',
      md: '#45B7D1',
      doc: '#96CEB4',
      docx: '#FFEAA7',
      rtf: '#DDA0DD',
      odt: '#98D8C8',
    };
    return colors[documentType] || '#95A5A6';
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
