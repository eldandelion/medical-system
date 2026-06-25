const fs = require('fs');

// 1. Rewrite handlers.ts
let handlers = fs.readFileSync('src/mocks/handlers.ts', 'utf8');
if (!handlers.includes('const api = ')) {
  handlers = handlers.replace(
    "export const handlers = [",
    "const api = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\\//, '')}`;\n\nexport const handlers = ["
  );
  handlers = handlers.replace(/http\.(get|post|put|delete)\('(\/api\/[^']+)'/g, "http.$1(api('$2')");
  fs.writeFileSync('src/mocks/handlers.ts', handlers);
}

// 2. Rewrite useDataFetch.ts
let useDataFetch = fs.readFileSync('src/hooks/useDataFetch.ts', 'utf8');
if (!useDataFetch.includes('const fetchUrl')) {
  useDataFetch = useDataFetch.replace(
    "fetch(url, options)",
    "const fetchUrl = url.startsWith('/') ? `${import.meta.env.BASE_URL}${url.slice(1)}` : url;\n    fetch(fetchUrl, options)"
  );
  fs.writeFileSync('src/hooks/useDataFetch.ts', useDataFetch);
}

// 3. Rewrite utils/api.ts
let utilsApi = fs.readFileSync('src/utils/api.ts', 'utf8');
if (!utilsApi.includes('const fetchUrl')) {
  utilsApi = utilsApi.replace(
    "const response = await fetch(url, options);",
    "const fetchUrl = url.startsWith('/') ? `${import.meta.env.BASE_URL}${url.slice(1)}` : url;\n    const response = await fetch(fetchUrl, options);"
  );
  fs.writeFileSync('src/utils/api.ts', utilsApi);
}

// 4. Rewrite components
const comps = [
  'src/components/assessments/AssessmentFlow.tsx',
  'src/components/records/ReferralCreationForm.tsx',
  'src/components/records/ReferralDetailsView.tsx'
];

for (const file of comps) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/fetch\('(\/api\/[^']+)'/g, "fetch(`${import.meta.env.BASE_URL}$1`.replace('/\/api', 'api'))");
  content = content.replace(/fetch\(`(\/api\/[^`]+)`/g, "fetch(`${import.meta.env.BASE_URL}$1`.replace('/\/api', 'api'))");
  fs.writeFileSync(file, content);
}
