const fs = require('fs');
const path = require('path');
const { swaggerSpec } = require('../src/config/swagger');

const methodsOrder = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'];

const formatMethod = (method) => method.toUpperCase();

const isAuthRequired = (op) => Array.isArray(op.security) && op.security.length > 0 ? 'Yes' : 'No';

const collectOperations = () => {
  const rows = [];
  for (const [routePath, methods] of Object.entries(swaggerSpec.paths || {})) {
    for (const method of methodsOrder) {
      const op = methods[method];
      if (!op) continue;
      rows.push({
        method: formatMethod(method),
        path: routePath,
        operationId: op.operationId || '',
        tag: Array.isArray(op.tags) && op.tags.length ? op.tags[0] : '',
        auth: isAuthRequired(op),
        summary: op.summary || '',
      });
    }
  }
  return rows;
};

const toMarkdownTable = (rows) => {
  const header = '| Method | Path | operationId | Tag | Auth | Summary |';
  const sep = '|---|---|---|---|---|---|';
  const lines = rows.map((row) => `| ${row.method} | \`${row.path}\` | \`${row.operationId}\` | ${row.tag} | ${row.auth} | ${row.summary} |`);
  return [header, sep, ...lines].join('\n');
};

const tagGroups = (swaggerSpec['x-tagGroups'] || [])
  .map((group) => `- **${group.name}**: ${group.tags.join(', ')}`)
  .join('\n');

const operations = collectOperations();

const content = `# Glossy Store Backend API\n\n` +
`Version: \`${swaggerSpec.info?.version || 'unknown'}\`\n\n` +
`Base URL: \`/api\`\n\n` +
`This file is generated from \`src/config/swagger.js\` to keep endpoint docs 1:1 with Swagger.\n\n` +
`## Tag Groups\n${tagGroups}\n\n` +
`## Operation Index\n` +
toMarkdownTable(operations) +
`\n\n## Notes\n` +
`- Use Swagger UI for full request/response examples: \`/api/docs\`.\n` +
`- Use Swagger JSON for SDK generation: \`/api/docs.json\`.\n`;

const outputPath = path.join(__dirname, '..', 'API.md');
fs.writeFileSync(outputPath, content, 'utf8');
console.log(`API.md generated with ${operations.length} operations.`);
