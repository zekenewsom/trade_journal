// benchmark_performance_indexes.js
// Usage: node scripts/benchmark_performance_indexes.js
// Run this script BEFORE and AFTER applying migration 009_add_performance_indexes.sql
// to measure the impact of performance indexes on key analytics queries.

const path = require('path');
const db = require(path.join(__dirname, '../src/database/db.js'));

async function benchmark(fn, label, args = [], runs = 5) {
  const times = [];
  for (let i = 0; i < runs; i++) {
    const start = process.hrtime.bigint();
    await fn(...args);
    const end = process.hrtime.bigint();
    times.push(Number(end - start) / 1e6); // ms
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`${label}: avg ${avg.toFixed(2)} ms over ${runs} runs (min: ${Math.min(...times).toFixed(2)} ms, max: ${Math.max(...times).toFixed(2)} ms)`);
  return avg;
}

async function main() {
  console.log('--- Benchmark: Performance Indexes ---');
  // 1. Analytics calculation
  await benchmark(() => db.calculateAnalyticsData({}), 'Analytics Calculation');

  // 2. Trade-list loading
  await benchmark(() => db.fetchTradesForListView(), 'Trade List Loading');

  // 3. Account-balance calculation (pick first account)
  const accounts = db.getAccounts();
  if (accounts.length === 0) {
    console.warn('No accounts found for account-balance benchmark. Skipping.');
  } else {
    const accountId = accounts[0].account_id || accounts[0].id;
    await benchmark(() => db.getAccountBalance(accountId), 'Account Balance Calculation', [accountId]);
  }

  console.log('\nRun this script before and after applying migration 009_add_performance_indexes.sql.\nCopy the results into the migration file comments to validate or update the claimed improvements.');
}

main(); 