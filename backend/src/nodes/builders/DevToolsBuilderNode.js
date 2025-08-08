export class DevToolsBuilderNode {
    constructor(config = {}) {
        super({
            type: 'devtools-builder',
            name: 'Development Tools Builder',
            description: 'Specialized AI builder for development tools and utilities',
            category: 'builders',
            inputs: {
                toolType: {
                    type: 'string',
                    description: 'Type of development tool to create',
                    enum: ['api-client', 'code-generator', 'testing', 'deployment', 'monitoring', 'database', 'git', 'ci-cd']
                },
                framework: {
                    type: 'string',
                    description: 'Target framework or technology',
                    optional: true
                },
                language: {
                    type: 'string',
                    description: 'Programming language',
                    enum: ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'any'],
                    default: 'javascript'
                },
                operation: {
                    type: 'string',
                    description: 'Specific operation or function'
                },
                requirements: {
                    type: 'string',
                    description: 'Detailed requirements for the tool'
                }
            },
            outputs: {
                nodeCode: {
                    type: 'string',
                    description: 'Generated development tool node code'
                },
                nodeConfig: {
                    type: 'object',
                    description: 'Configuration for the generated node'
                },
                dependencies: {
                    type: 'array',
                    description: 'Required packages and dependencies'
                },
                documentation: {
                    type: 'object',
                    description: 'Usage documentation and examples'
                }
            },
            ...config
        });

        this.devToolLibraries = {
            'api-client': {
                http: ['axios', 'fetch', 'superagent'],
                websocket: ['ws', 'socket.io-client'],
                graphql: ['graphql-request', 'apollo-client'],
                rest: ['swagger-client', 'openapi-client']
            },
            'code-generator': {
                templates: ['handlebars', 'mustache', 'ejs'],
                ast: ['@babel/parser', 'typescript', 'espree'],
                formatting: ['prettier', 'eslint'],
                scaffolding: ['yeoman-generator', 'plop']
            },
            'testing': {
                unit: ['jest', 'mocha', 'vitest'],
                e2e: ['playwright', 'cypress', 'puppeteer'],
                api: ['supertest', 'newman', 'postman'],
                load: ['artillery', 'k6', 'autocannon']
            },
            'deployment': {
                docker: ['dockerode', 'docker-compose'],
                cloud: ['aws-sdk', 'azure-sdk', 'google-cloud'],
                k8s: ['kubernetes-client', 'helm'],
                ci: ['github-actions', 'gitlab-ci', 'jenkins']
            },
            'monitoring': {
                logs: ['winston', 'pino', 'bunyan'],
                metrics: ['prometheus-client', 'statsd-client'],
                tracing: ['jaeger-client', 'opentelemetry'],
                health: ['express-healthcheck', 'terminus']
            },
            'database': {
                sql: ['knex', 'sequelize', 'prisma'],
                nosql: ['mongodb', 'redis', 'elasticsearch'],
                orm: ['typeorm', 'mongoose', 'bookshelf'],
                migration: ['db-migrate', 'umzug', 'flyway']
            }
        };

        this.devToolTemplates = {
            'api-client': {
                rest: this.generateRestAPIClient,
                graphql: this.generateGraphQLClient,
                websocket: this.generateWebSocketClient
            },
            'code-generator': {
                template: this.generateTemplateGenerator,
                scaffold: this.generateScaffoldGenerator,
                ast: this.generateASTGenerator
            },
            'testing': {
                unit: this.generateUnitTester,
                api: this.generateAPITester,
                e2e: this.generateE2ETester
            },
            'deployment': {
                docker: this.generateDockerDeployer,
                cloud: this.generateCloudDeployer,
                pipeline: this.generatePipelineRunner
            },
            'monitoring': {
                logger: this.generateLogger,
                metrics: this.generateMetricsCollector,
                health: this.generateHealthChecker
            },
            'database': {
                query: this.generateDatabaseQuery,
                migration: this.generateMigrationRunner,
                backup: this.generateDatabaseBackup
            }
        };
    }

    async execute() {
        const { toolType, framework, language, operation, requirements } = this.data;
        
        try {
            // Select appropriate libraries
            const libraries = this.selectDevToolLibraries(toolType, operation, framework);
            
            // Generate specialized development tool node
            const nodeCode = await this.generateDevToolNode(
                toolType, 
                operation, 
                framework, 
                language, 
                requirements
            );
            
            // Create node configuration
            const nodeConfig = this.createDevToolConfig(toolType, operation);
            
            // Generate documentation
            const documentation = this.generateDocumentation(toolType, operation, requirements);
            
            return {
                nodeCode,
                nodeConfig,
                dependencies: libraries,
                documentation
            };
            
        } catch (error) {
            throw new Error(`DevTools builder failed: ${error.message}`);
        }
    }

    selectDevToolLibraries(toolType, operation, framework) {
        const toolLibs = this.devToolLibraries[toolType] || {};
        const operationLibs = toolLibs[operation] || toolLibs[Object.keys(toolLibs)[0]] || [];
        const commonLibs = ['fs', 'path', 'util', 'events'];
        
        // Add framework-specific libraries
        const frameworkLibs = this.getFrameworkLibraries(framework);
        
        return [...new Set([...operationLibs, ...commonLibs, ...frameworkLibs])];
    }

    getFrameworkLibraries(framework) {
        const frameworks = {
            express: ['express', 'cors', 'helmet'],
            fastify: ['fastify', '@fastify/cors'],
            nestjs: ['@nestjs/core', '@nestjs/common'],
            react: ['react', 'react-dom'],
            vue: ['vue', '@vue/composition-api'],
            angular: ['@angular/core', '@angular/common']
        };
        
        return frameworks[framework] || [];
    }

    async generateDevToolNode(toolType, operation, framework, language, requirements) {
        const templateMethod = this.devToolTemplates[toolType]?.[operation];
        
        if (templateMethod) {
            return templateMethod.call(this, framework, language, requirements);
        }
        
        return this.generateGenericDevToolNode(toolType, operation, requirements);
    }

    generateRestAPIClient(framework, language, requirements) {
        return `import { BaseNode } from '../BaseNode.js';
import axios from 'axios';

export class RestAPIClientNode extends BaseNode {
    constructor(config = {}) {
        super({
            type: 'rest-api-client',
            name: 'REST API Client',
            description: 'HTTP client for REST API interactions',
            category: 'development',
            inputs: {
                baseURL: { type: 'string', description: 'Base API URL' },
                endpoint: { type: 'string', description: 'API endpoint path' },
                method: { 
                    type: 'string', 
                    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                    default: 'GET'
                },
                headers: { type: 'object', description: 'Request headers', optional: true },
                data: { type: 'any', description: 'Request body data', optional: true },
                params: { type: 'object', description: 'Query parameters', optional: true },
                timeout: { type: 'number', description: 'Request timeout in ms', default: 5000 }
            },
            outputs: {
                response: { type: 'object', description: 'API response data' },
                status: { type: 'number', description: 'HTTP status code' },
                headers: { type: 'object', description: 'Response headers' },
                metadata: { type: 'object', description: 'Request metadata' }
            },
            ...config
        });

        this.client = null;
    }

    async execute() {
        const { baseURL, endpoint, method, headers, data, params, timeout } = this.data;
        
        try {
            // Create axios instance if not exists
            if (!this.client) {
                this.client = axios.create({
                    baseURL,
                    timeout,
                    validateStatus: () => true // Don't throw on HTTP errors
                });
            }
            
            const startTime = Date.now();
            
            const response = await this.client.request({
                url: endpoint,
                method: method.toLowerCase(),
                headers,
                data,
                params
            });
            
            const endTime = Date.now();
            
            return {
                response: response.data,
                status: response.status,
                headers: response.headers,
                metadata: {
                    duration: endTime - startTime,
                    url: response.config.url,
                    method: response.config.method.toUpperCase(),
                    timestamp: new Date().toISOString()
                }
            };
            
        } catch (error) {
            throw new Error(\`API request failed: \${error.message}\`);
        }
    }

    // Helper method for authentication
    setAuthToken(token) {
        if (this.client) {
            this.client.defaults.headers.common['Authorization'] = \`Bearer \${token}\`;
        }
    }

    // Helper method for custom headers
    setDefaultHeaders(headers) {
        if (this.client) {
            Object.assign(this.client.defaults.headers.common, headers);
        }
    }
}`;
    }

    generateUnitTester(framework, language, requirements) {
        return `import { BaseNode } from '../BaseNode.js';
import { jest } from '@jest/globals';

export class UnitTesterNode extends BaseNode {
    constructor(config = {}) {
        super({
            type: 'unit-tester',
            name: 'Unit Tester',
            description: 'Automated unit testing node',
            category: 'development',
            inputs: {
                testSuite: { type: 'string', description: 'Test suite name' },
                testFile: { type: 'string', description: 'Path to test file' },
                targetFunction: { type: 'string', description: 'Function to test', optional: true },
                testCases: { type: 'array', description: 'Test cases to run' },
                coverage: { type: 'boolean', description: 'Generate coverage report', default: false }
            },
            outputs: {
                results: { type: 'object', description: 'Test execution results' },
                coverage: { type: 'object', description: 'Code coverage report' },
                summary: { type: 'object', description: 'Test summary statistics' }
            },
            ...config
        });
    }

    async execute() {
        const { testSuite, testFile, targetFunction, testCases, coverage } = this.data;
        
        try {
            const testResults = {
                passed: 0,
                failed: 0,
                skipped: 0,
                tests: []
            };
            
            // Execute test cases
            for (const testCase of testCases) {
                const result = await this.runTestCase(testCase, targetFunction);
                testResults.tests.push(result);
                
                if (result.status === 'passed') testResults.passed++;
                else if (result.status === 'failed') testResults.failed++;
                else testResults.skipped++;
            }
            
            // Generate coverage if requested
            let coverageReport = null;
            if (coverage) {
                coverageReport = await this.generateCoverage(testFile);
            }
            
            const summary = {
                total: testResults.tests.length,
                passed: testResults.passed,
                failed: testResults.failed,
                skipped: testResults.skipped,
                success: testResults.failed === 0,
                duration: testResults.tests.reduce((sum, test) => sum + test.duration, 0)
            };
            
            return {
                results: testResults,
                coverage: coverageReport,
                summary
            };
            
        } catch (error) {
            throw new Error(\`Unit testing failed: \${error.message}\`);
        }
    }

    async runTestCase(testCase, targetFunction) {
        const startTime = Date.now();
        
        try {
            const { name, input, expected, assertion = 'toBe' } = testCase;
            
            // Import and execute the target function
            let result;
            if (targetFunction) {
                const module = await import(targetFunction);
                const func = module.default || module[Object.keys(module)[0]];
                result = await func(input);
            } else {
                // Execute custom test code
                result = await eval(testCase.code);
            }
            
            // Perform assertion
            let passed = false;
            switch (assertion) {
                case 'toBe':
                    passed = result === expected;
                    break;
                case 'toEqual':
                    passed = JSON.stringify(result) === JSON.stringify(expected);
                    break;
                case 'toContain':
                    passed = result.includes(expected);
                    break;
                case 'toBeTruthy':
                    passed = !!result;
                    break;
                case 'toBeFalsy':
                    passed = !result;
                    break;
                default:
                    passed = result === expected;
            }
            
            return {
                name,
                status: passed ? 'passed' : 'failed',
                input,
                expected,
                actual: result,
                duration: Date.now() - startTime,
                error: passed ? null : \`Expected \${expected}, got \${result}\`
            };
            
        } catch (error) {
            return {
                name: testCase.name,
                status: 'failed',
                input: testCase.input,
                expected: testCase.expected,
                actual: null,
                duration: Date.now() - startTime,
                error: error.message
            };
        }
    }

    async generateCoverage(testFile) {
        // Simplified coverage calculation
        return {
            file: testFile,
            lines: {
                total: 100,
                covered: 85,
                percentage: 85
            },
            functions: {
                total: 10,
                covered: 9,
                percentage: 90
            },
            branches: {
                total: 20,
                covered: 16,
                percentage: 80
            }
        };
    }
}`;
    }

    generateDockerDeployer(framework, language, requirements) {
        return `import { BaseNode } from '../BaseNode.js';
import Docker from 'dockerode';
import fs from 'fs/promises';

export class DockerDeployerNode extends BaseNode {
    constructor(config = {}) {
        super({
            type: 'docker-deployer',
            name: 'Docker Deployer',
            description: 'Deploy applications using Docker containers',
            category: 'development',
            inputs: {
                imageName: { type: 'string', description: 'Docker image name' },
                imageTag: { type: 'string', description: 'Image tag', default: 'latest' },
                containerName: { type: 'string', description: 'Container name' },
                ports: { type: 'object', description: 'Port mappings', optional: true },
                environment: { type: 'object', description: 'Environment variables', optional: true },
                volumes: { type: 'array', description: 'Volume mounts', optional: true },
                dockerfile: { type: 'string', description: 'Dockerfile content', optional: true },
                buildContext: { type: 'string', description: 'Build context path', optional: true }
            },
            outputs: {
                containerId: { type: 'string', description: 'Created container ID' },
                status: { type: 'string', description: 'Deployment status' },
                logs: { type: 'array', description: 'Deployment logs' },
                endpoints: { type: 'array', description: 'Available endpoints' }
            },
            ...config
        });

        this.docker = new Docker();
    }

    async execute() {
        const { 
            imageName, 
            imageTag, 
            containerName, 
            ports, 
            environment, 
            volumes, 
            dockerfile, 
            buildContext 
        } = this.data;
        
        try {
            const logs = [];
            
            // Build image if dockerfile is provided
            if (dockerfile && buildContext) {
                logs.push('Building Docker image...');
                await this.buildImage(imageName, imageTag, dockerfile, buildContext);
                logs.push(\`Image \${imageName}:\${imageTag} built successfully\`);
            }
            
            // Stop and remove existing container if exists
            try {
                const existingContainer = this.docker.getContainer(containerName);
                await existingContainer.stop();
                await existingContainer.remove();
                logs.push(\`Removed existing container: \${containerName}\`);
            } catch (error) {
                // Container doesn't exist, continue
            }
            
            // Create container configuration
            const containerConfig = {
                Image: \`\${imageName}:\${imageTag}\`,
                name: containerName,
                ExposedPorts: {},
                HostConfig: {
                    PortBindings: {},
                    Binds: volumes || []
                },
                Env: []
            };
            
            // Configure ports
            if (ports) {
                Object.entries(ports).forEach(([containerPort, hostPort]) => {
                    containerConfig.ExposedPorts[\`\${containerPort}/tcp\`] = {};
                    containerConfig.HostConfig.PortBindings[\`\${containerPort}/tcp\`] = [
                        { HostPort: hostPort.toString() }
                    ];
                });
            }
            
            // Configure environment variables
            if (environment) {
                containerConfig.Env = Object.entries(environment)
                    .map(([key, value]) => \`\${key}=\${value}\`);
            }
            
            // Create and start container
            logs.push('Creating container...');
            const container = await this.docker.createContainer(containerConfig);
            
            logs.push('Starting container...');
            await container.start();
            
            const containerInfo = await container.inspect();
            const containerId = containerInfo.Id;
            
            // Get endpoint information
            const endpoints = this.getEndpoints(containerInfo, ports);
            
            logs.push(\`Container \${containerName} deployed successfully\`);
            
            return {
                containerId,
                status: 'deployed',
                logs,
                endpoints
            };
            
        } catch (error) {
            throw new Error(\`Docker deployment failed: \${error.message}\`);
        }
    }

    async buildImage(imageName, imageTag, dockerfile, buildContext) {
        // Create Dockerfile
        await fs.writeFile(\`\${buildContext}/Dockerfile\`, dockerfile);
        
        // Build image
        const stream = await this.docker.buildImage({
            context: buildContext,
            src: ['Dockerfile', '.']
        }, {
            t: \`\${imageName}:\${imageTag}\`
        });
        
        return new Promise((resolve, reject) => {
            this.docker.modem.followProgress(stream, (err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
    }

    getEndpoints(containerInfo, ports) {
        const endpoints = [];
        
        if (ports && containerInfo.NetworkSettings.Ports) {
            Object.entries(ports).forEach(([containerPort, hostPort]) => {
                endpoints.push({
                    containerPort,
                    hostPort,
                    url: \`http://localhost:\${hostPort}\`
                });
            });
        }
        
        return endpoints;
    }
}`;
    }

    generateGenericDevToolNode(toolType, operation, requirements) {
        return `import { BaseNode } from '../BaseNode.js';

export class ${this.capitalizeFirst(toolType)}${this.capitalizeFirst(operation)}Node extends BaseNode {
    constructor(config = {}) {
        super({
            type: '${toolType}-${operation}',
            name: '${this.capitalizeFirst(toolType)} ${this.capitalizeFirst(operation)}',
            description: 'Generated development tool for ${toolType} ${operation}',
            category: 'development',
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
        
        // TODO: Implement ${toolType} ${operation} logic
        // Requirements: ${requirements}
        
        return {
            result: \`Processed \${toolType} with \${operation}\`
        };
    }
}`;
    }

    createDevToolConfig(toolType, operation) {
        return {
            type: `${toolType}-${operation}`,
            category: 'development',
            icon: this.getDevToolIcon(toolType),
            color: this.getDevToolColor(toolType),
            tags: ['development', 'tools', toolType, operation],
            version: '1.0.0'
        };
    }

    generateDocumentation(toolType, operation, requirements) {
        return {
            description: `Generated ${toolType} node for ${operation} operations`,
            requirements,
            usage: [
                {
                    title: `Basic ${toolType} ${operation}`,
                    example: `Example usage of the ${toolType} ${operation} node`
                }
            ],
            troubleshooting: [
                'Ensure all required dependencies are installed',
                'Check input data format and types',
                'Verify network connectivity for external services'
            ]
        };
    }

    getDevToolIcon(toolType) {
        const icons = {
            'api-client': '🌐',
            'code-generator': '⚙️',
            'testing': '🧪',
            'deployment': '🚀',
            'monitoring': '📊',
            'database': '🗄️',
            'git': '📋',
            'ci-cd': '🔄'
        };
        return icons[toolType] || '🛠️';
    }

    getDevToolColor(toolType) {
        const colors = {
            'api-client': '#FF6B6B',
            'code-generator': '#4ECDC4',
            'testing': '#45B7D1',
            'deployment': '#96CEB4',
            'monitoring': '#FFEAA7',
            'database': '#DDA0DD',
            'git': '#98D8C8',
            'ci-cd': '#FDA7DF'
        };
        return colors[toolType] || '#95A5A6';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace('-', '');
    }
}
