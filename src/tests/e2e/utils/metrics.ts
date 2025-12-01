import fs from 'fs';
import path from 'path';

const METRICS_FILE = path.join(process.cwd(), 'tests', 'results', 'metrics.json');

export function saveMetric(metric: any) {
  let current: any[] = [];
  if (fs.existsSync(METRICS_FILE)) {
    current = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf-8'));
  }

  current.push({
    ...metric,
    timestamp: new Date().toISOString(),
  });

  fs.mkdirSync(path.dirname(METRICS_FILE), { recursive: true });
  fs.writeFileSync(METRICS_FILE, JSON.stringify(current, null, 2));
}
