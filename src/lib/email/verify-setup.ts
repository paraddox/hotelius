/**
 * Email System Setup Verification
 *
 * Run this script to verify your email system is configured correctly.
 * Usage: node -r tsx/register src/lib/email/verify-setup.ts
 */

import { resend, DEFAULT_FROM_EMAIL, SUPPORT_EMAIL } from './client';

interface VerificationResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

async function verifyEmailSetup(): Promise<void> {
  console.log('🔍 Verifying Email System Setup...\n');

  const results: VerificationResult[] = [];

  // Check 1: API Key
  results.push({
    check: 'Resend API Key',
    status: process.env.RESEND_API_KEY ? 'pass' : 'fail',
    message: process.env.RESEND_API_KEY
      ? 'API key is configured'
      : 'RESEND_API_KEY environment variable is not set',
  });

  // Check 2: From Email
  results.push({
    check: 'From Email Address',
    status: DEFAULT_FROM_EMAIL ? 'pass' : 'warning',
    message: DEFAULT_FROM_EMAIL
      ? `Using: ${DEFAULT_FROM_EMAIL}`
      : 'EMAIL_FROM not set, using default',
  });

  // Check 3: Support Email
  results.push({
    check: 'Support Email',
    status: SUPPORT_EMAIL ? 'pass' : 'warning',
    message: SUPPORT_EMAIL
      ? `Using: ${SUPPORT_EMAIL}`
      : 'SUPPORT_EMAIL not set, using default',
  });

  // Check 4: App URL
  results.push({
    check: 'Application URL',
    status: process.env.NEXT_PUBLIC_APP_URL ? 'pass' : 'warning',
    message: process.env.NEXT_PUBLIC_APP_URL
      ? `Using: ${process.env.NEXT_PUBLIC_APP_URL}`
      : 'NEXT_PUBLIC_APP_URL not set, email links may not work',
  });

  // Check 5: Test API connection
  try {
    // Try to list domains (requires API key)
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      results.push({
        check: 'Resend API Connection',
        status: 'pass',
        message: `Connected successfully. ${data.data?.length || 0} domain(s) configured.`,
      });

      // List domains
      if (data.data && data.data.length > 0) {
        console.log('\n📧 Configured Domains:');
        data.data.forEach((domain: any) => {
          console.log(
            `   - ${domain.name} (${domain.status === 'verified' ? '✓ Verified' : '⚠ Not verified'})`
          );
        });
        console.log('');
      }
    } else {
      results.push({
        check: 'Resend API Connection',
        status: 'fail',
        message: `API returned ${response.status}: ${response.statusText}`,
      });
    }
  } catch (error) {
    results.push({
      check: 'Resend API Connection',
      status: 'fail',
      message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }

  // Check 6: Email templates exist
  const templates = [
    'booking-confirmation',
    'booking-reminder',
    'booking-cancelled',
    'payment-receipt',
    'welcome-hotel',
  ];

  let templatesExist = 0;
  for (const template of templates) {
    try {
      await import(`./templates/${template}`);
      templatesExist++;
    } catch (error) {
      // Template doesn't exist
    }
  }

  results.push({
    check: 'Email Templates',
    status: templatesExist === templates.length ? 'pass' : 'warning',
    message: `${templatesExist}/${templates.length} templates found`,
  });

  // Print results
  console.log('Results:\n');

  results.forEach((result) => {
    const icon =
      result.status === 'pass' ? '✓' : result.status === 'fail' ? '✗' : '⚠';
    const color =
      result.status === 'pass'
        ? '\x1b[32m'
        : result.status === 'fail'
        ? '\x1b[31m'
        : '\x1b[33m';
    const reset = '\x1b[0m';

    console.log(
      `${color}${icon}${reset} ${result.check.padEnd(25)} ${result.message}`
    );
  });

  // Summary
  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warnings = results.filter((r) => r.status === 'warning').length;

  console.log('\n' + '─'.repeat(60));
  console.log(`\nSummary: ${passed} passed, ${failed} failed, ${warnings} warnings\n`);

  if (failed > 0) {
    console.log('❌ Email system has critical issues. Please fix the failures above.\n');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  Email system is functional but has warnings. Review above.\n');
  } else {
    console.log('✅ Email system is fully configured and ready to use!\n');
  }
}

// Run verification
verifyEmailSetup().catch((error) => {
  console.error('Error running verification:', error);
  process.exit(1);
});
