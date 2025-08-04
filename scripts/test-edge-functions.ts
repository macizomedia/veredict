import { config } from 'dotenv';

// Load environment variables
config();

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
  details?: any;
}

interface EdgeFunctionTestResult {
  function: string;
  status: 'success' | 'error' | 'timeout';
  responseTime?: number;
  response?: any;
  error?: string;
}

class EdgeFunctionTester {
  private readonly supabaseUrl: string;
  private readonly anonKey: string;
  private readonly serviceRoleKey: string;

  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!this.supabaseUrl || !this.anonKey) {
      throw new Error('Missing required Supabase environment variables');
    }
  }

  /**
   * Check if all required environment variables are present
   */
  private checkEnvironmentVariables(): HealthCheckResult {
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    const optional = [
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);
    const optionalMissing = optional.filter(key => !process.env[key]);

    if (missing.length > 0) {
      return {
        service: 'Environment Variables',
        status: 'unhealthy',
        error: `Missing required variables: ${missing.join(', ')}`
      };
    }

    return {
      service: 'Environment Variables',
      status: 'healthy',
      details: {
        required: required.map(key => ({ [key]: '✓ Present' })),
        optional: optionalMissing.length > 0 
          ? { missing: optionalMissing, note: 'Optional but recommended' }
          : '✓ All present'
      }
    };
  }

  /**
   * Health check for Supabase API connectivity
   */
  private async checkSupabaseConnectivity(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': this.anonKey,
          'Authorization': `Bearer ${this.anonKey}`,
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          service: 'Supabase API',
          status: 'healthy',
          responseTime,
          details: {
            url: this.supabaseUrl,
            statusCode: response.status,
            headers: Object.fromEntries(response.headers.entries())
          }
        };
      } else {
        return {
          service: 'Supabase API',
          status: 'unhealthy',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        service: 'Supabase API',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Health check for Edge Functions endpoint
   */
  private async checkEdgeFunctionsEndpoint(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const functionsUrl = `${this.supabaseUrl}/functions/v1/`;
    
    try {
      const response = await fetch(functionsUrl, {
        method: 'GET',
        headers: {
          'apikey': this.anonKey,
          'Authorization': `Bearer ${this.anonKey}`,
        },
        signal: AbortSignal.timeout(10000)
      });

      const responseTime = Date.now() - startTime;

      return {
        service: 'Edge Functions Endpoint',
        status: response.status === 404 ? 'healthy' : 'unknown', // 404 is expected for functions root
        responseTime,
        details: {
          url: functionsUrl,
          statusCode: response.status,
          note: response.status === 404 ? 'Expected 404 for functions root' : 'Unexpected response'
        }
      };
    } catch (error) {
      return {
        service: 'Edge Functions Endpoint',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test the AI_Agent edge function with a simple request
   */
  private async testAIAgentFunction(): Promise<EdgeFunctionTestResult> {
    const startTime = Date.now();
    const functionUrl = `${this.supabaseUrl}/functions/v1/AI_Agent`;
    
    const testPayload = {
      prompt: "Write a short test article about renewable energy",
      sources: ["https://example.com/renewable-energy"],
      tone: "neutral",
      style: "journalistic",
      length: "short"
    };

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.anonKey,
          'Authorization': `Bearer ${this.anonKey}`,
        },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(30000) // 30 second timeout for AI processing
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        // Handle streaming response
        if (response.headers.get('content-type')?.includes('text/event-stream')) {
          const reader = response.body?.getReader();
          const chunks: string[] = [];
          
          if (reader) {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(new TextDecoder().decode(value));
              }
            } finally {
              reader.releaseLock();
            }
          }

          return {
            function: 'AI_Agent',
            status: 'success',
            responseTime,
            response: {
              type: 'streaming',
              chunks: chunks.length,
              data: chunks.join('')
            }
          };
        } else {
          // Handle JSON response
          const data = await response.json();
          return {
            function: 'AI_Agent',
            status: 'success',
            responseTime,
            response: data
          };
        }
      } else {
        const errorText = await response.text();
        return {
          function: 'AI_Agent',
          status: 'error',
          responseTime,
          error: `HTTP ${response.status}: ${errorText}`
        };
      }
    } catch (error) {
      return {
        function: 'AI_Agent',
        status: error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'error',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Run comprehensive health checks
   */
  async runHealthChecks(): Promise<HealthCheckResult[]> {
    console.log('🔍 Running Health Checks...\n');

    const checks = [
      this.checkEnvironmentVariables(),
      await this.checkSupabaseConnectivity(),
      await this.checkEdgeFunctionsEndpoint()
    ];

    return checks;
  }

  /**
   * Run edge function tests
   */
  async runFunctionTests(): Promise<EdgeFunctionTestResult[]> {
    console.log('🧪 Testing Edge Functions...\n');

    const tests = [
      await this.testAIAgentFunction()
    ];

    return tests;
  }

  /**
   * Print formatted results
   */
  printHealthResults(results: HealthCheckResult[]): void {
    console.log('📊 Health Check Results:');
    console.log('========================\n');

    results.forEach(result => {
      const statusIcon = result.status === 'healthy' ? '✅' : 
                        result.status === 'unhealthy' ? '❌' : '⚠️';
      
      console.log(`${statusIcon} ${result.service}: ${result.status.toUpperCase()}`);
      
      if (result.responseTime) {
        console.log(`   Response Time: ${result.responseTime}ms`);
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
      
      console.log('');
    });
  }

  printTestResults(results: EdgeFunctionTestResult[]): void {
    console.log('🎯 Function Test Results:');
    console.log('==========================\n');

    results.forEach(result => {
      const statusIcon = result.status === 'success' ? '✅' : 
                        result.status === 'timeout' ? '⏱️' : '❌';
      
      console.log(`${statusIcon} ${result.function}: ${result.status.toUpperCase()}`);
      
      if (result.responseTime) {
        console.log(`   Response Time: ${result.responseTime}ms`);
      }
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.response) {
        console.log(`   Response: ${JSON.stringify(result.response, null, 2)}`);
      }
      
      console.log('');
    });
  }

  /**
   * Run complete test suite
   */
  async runCompleteTest(): Promise<void> {
    console.log('🚀 Supabase Edge Functions Test Suite');
    console.log('=====================================\n');

    try {
      // Run health checks first
      const healthResults = await this.runHealthChecks();
      this.printHealthResults(healthResults);

      // Check if basic connectivity is healthy before running function tests
      const connectivityHealthy = healthResults.every(result => 
        result.service === 'Environment Variables' || result.status === 'healthy'
      );

      if (!connectivityHealthy) {
        console.log('❌ Skipping function tests due to connectivity issues\n');
        return;
      }

      // Run function tests
      const testResults = await this.runFunctionTests();
      this.printTestResults(testResults);

      // Summary
      const healthyCount = healthResults.filter(r => r.status === 'healthy').length;
      const successfulTests = testResults.filter(r => r.status === 'success').length;

      console.log('📋 Summary:');
      console.log(`   Health Checks: ${healthyCount}/${healthResults.length} passed`);
      console.log(`   Function Tests: ${successfulTests}/${testResults.length} passed`);

    } catch (error) {
      console.error('💥 Test suite failed:', error);
      process.exit(1);
    }
  }
}

// Run the tests if this script is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new EdgeFunctionTester();
  tester.runCompleteTest().catch(console.error);
}

export { EdgeFunctionTester };