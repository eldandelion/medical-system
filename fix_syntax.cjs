const fs = require('fs');
const files = [
  'src/components/assessments/AssessmentFlow.tsx',
  'src/components/records/ReferralCreationForm.tsx',
  'src/components/records/ReferralDetailsView.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Fix comma: )), { -> ), {
  content = content.replace(/\.replace\('\/\/api', 'api'\)\), \{/g, ".replace('//api', '/api'), {");
  
  // Fix extra parenthesis: ))) -> ))
  content = content.replace(/\.replace\('\/\/api', 'api'\)\)\)/g, ".replace('//api', '/api'))");
  
  // Also correct the replace argument if it was 'api' to '/api' so it replaces '//api' with '/api'
  // Actually, if it's '/medical-system//api', we want it to be '/medical-system/api'.
  // Replacing '//api' with '/api' works perfectly.
  content = content.replace(/\.replace\('\/\/api', 'api'\)/g, ".replace('//api', '/api')");
  
  fs.writeFileSync(file, content);
}
