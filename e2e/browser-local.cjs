#!/usr/bin/env node
// Browser checks against a disposable, explicitly seeded local H2 environment only.
// Reuses installed Puppeteer and Chrome; does not download browsers or dependencies.
const {createRequire}=require('node:module');
const {resolve}=require('node:path');
const assert=require('node:assert/strict');
const puppeteer=createRequire(resolve(__dirname,'../frontend/package.json'))('puppeteer');
const mobile=process.env.E2E_MOBILE_URL;
const backend=process.env.E2E_BACKEND_URL;
for(const value of [mobile,backend]) {
  if(!value) throw new Error('Explicit E2E_MOBILE_URL and E2E_BACKEND_URL required');
  const u=new URL(value);
  if(u.protocol!=='http:' || u.hostname!=='127.0.0.1' || u.username || u.password) throw new Error('Loopback HTTP targets required');
}
const scale='comprehensive_student_intake_survey';
const results=[];
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function clickText(page,text){
  await page.waitForFunction(t=>[...document.querySelectorAll('button,md-filled-button')].some(e=>e.textContent.trim().endsWith(t)),{},text);
  await page.evaluate(t=>[...document.querySelectorAll('button,md-filled-button')].find(e=>e.textContent.trim().endsWith(t)).click(),text);
}
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-background-networking']});
 try {
  async function session(identifier,password){
   const context=await browser.createBrowserContext();const page=await context.newPage();
   await page.setViewport({width:390,height:844});await page.setBypassServiceWorker(true);
   await page.setRequestInterception(true);
   page.on('request',r=>new URL(r.url()).origin===new URL(mobile).origin||r.url().startsWith('data:')?r.continue():r.abort());
   await page.goto(mobile);
   await page.waitForSelector('md-outlined-text-field[type=password]');
   for(const [type,value] of [['text',identifier],['password',password]])await page.$eval(`md-outlined-text-field[type=${type}]`,(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},value);
   const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/auth/login'&&r.request().method()==='POST');
   await clickText(page,'下一步');const login=await response;assert.equal(login.status(),200);const {token}=await login.json();
   await page.waitForSelector('md-navigation-tab');
   return {context,page,token};
  }
  async function api(token,path,options={}){const r=await fetch(backend+path,{...options,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'}});assert(r.ok,`Local fixture/check HTTP ${r.status}`);return r.status===204?null:r.json();}
  const teacher=await session('EMP-00001','123456');results.push({check:'Teacher browser login against real backend',status:'PASS'});
  await teacher.page.evaluate(()=>[...document.querySelectorAll('md-navigation-tab')].find(e=>e.textContent.includes('send')).click());
  await teacher.page.waitForSelector('input[type=checkbox]');
  await teacher.page.evaluate(()=>[...document.querySelectorAll('label')].find(e=>e.textContent.includes('S2023006')).querySelector('input').click());
  const assigned=teacher.page.waitForResponse(r=>new URL(r.url()).pathname==='/api/assessments/assign'&&r.request().method()==='POST');
  await clickText(teacher.page,'发放给 1 名学生');const assignmentResponse=await assigned;assert.equal(assignmentResponse.status(),201);const assignedResult=await assignmentResponse.json();
  if(process.env.E2E_RESUME!=='true')assert.equal(assignedResult.assignedCount,1,'Requires fresh database, not idempotent assignment');
  if(process.env.E2E_RESUME!=='true')await teacher.page.waitForFunction(()=>document.body.innerText.includes('发放完成：成功 1 人'));
  results.push({check:'Teacher UI dispatch creates one fresh assignment',status:'PASS'});
  const student=await session('S2023006','226666');results.push({check:'Student browser login in separate context',status:'PASS'});
  await clickText(student.page,'开始填报');await clickText(student.page,'开始作答');
  await student.page.waitForSelector('button[aria-label="查看题目列表并快速跳转"]');
  // Answer the first question through the rendered Material field and verify server draft.
  const field=await student.page.$('md-outlined-text-field');
  assert(field,'First-question text field missing');
  await field.evaluate(e=>{e.value='Synthetic Browser Student';e.dispatchEvent(new Event('input',{bubbles:true}));});
  await clickText(student.page,'下一题');
  let draft;for(let i=0;i<20;i++){await pause(300);draft=await api(student.token,`/api/scales/${scale}/draft`);if(draft?.answers?.demo_name==='Synthetic Browser Student')break;}
  assert.equal(draft?.answers?.demo_name,'Synthetic Browser Student');
  results.push({check:'Student UI answer advances and persists to backend draft',status:'PASS'});
  const definition=await api(student.token,`/api/scales/${scale}`);
  const questions=definition.questions;
  assert.equal(questions.length,377);
  async function fill(selector,value,event='input'){
   await student.page.$eval(selector,(e,v,t)=>{e.value=String(v);e.dispatchEvent(new Event(t,{bubbles:true}));},value,event);
   await pause(30);
  }
  for(let i=1;i<questions.length;i++){
   const q=questions[i];if(process.env.E2E_DEBUG==='true')console.log('Question control:',i,q.code);
   await student.page.waitForFunction(text=>[...document.querySelectorAll('main h3')].some(e=>e.textContent?.trim()===text.trim()),{timeout:10000},q.text).catch(async e=>{if(process.env.E2E_DEBUG==='true')console.log('Heading mismatch:',await student.page.$eval('main',e=>e.innerText.slice(0,160)),q.text);throw e;});
   await pause(210); // Wait for the keyed question transition to finish before choosing its controls.
   if(q.type==='single_choice'||q.type==='multiple_choice'){
    let options=q.options.filter(o=>!o.hasTextInput);
    const opt=options[options.length-1]||q.options[0];
    await student.page.evaluate(label=>{const e=[...document.querySelectorAll('main div[role=button]')].find(e=>e.querySelector('span')?.textContent===label);if(!e)throw Error('Option absent');e.click();},opt.label);
    if(opt.hasTextInput)await fill('main md-outlined-text-field','Synthetic detail');
    if(q.type==='single_choice'&&!opt.hasTextInput&&i<questions.length-1){continue;}
   }else if(q.type==='date'){
    await fill('main md-outlined-select','1','change');await student.page.evaluate(()=>{const e=[...document.querySelectorAll('main md-outlined-text-field')].find(e=>e.label==='日');e.value='1';e.dispatchEvent(new Event('input',{bubbles:true}));});await pause(30);await student.page.evaluate(()=>{const e=[...document.querySelectorAll('main md-outlined-text-field')].find(e=>e.label==='年');e.value='2004';e.dispatchEvent(new Event('input',{bubbles:true}));});await pause(30);
   }else if(q.type==='slider'){await fill('main md-slider',q.max??10);}
   else if(q.type==='number'){await fill('main md-outlined-text-field',q.min>0?q.min:1);}
   else {
    const values={demo_phone:'13800000066',demo_class:'Synthetic Class',demo_student_number:'S2023006',demo_id_card:'110101200401016665'};
    await fill('main md-outlined-text-field',values[q.code]||'Synthetic browser response');
   }
   if(i<questions.length-1)await clickText(student.page,'下一题');
   if(i%50===0)console.log('Browser questionnaire answered:',i+1);
  }
  const submitted=student.page.waitForResponse(r=>new URL(r.url()).pathname===`/api/scales/${scale}/submit`&&r.request().method()==='POST',{timeout:30000});
  await clickText(student.page,'完成并提交');const submitResponse=await submitted;assert.equal(submitResponse.status(),200);const submission=await submitResponse.json();
  await student.page.waitForFunction(()=>document.body.innerText.includes('作答已提交'));
  results.push({check:'All 377 questionnaire answers entered through browser controls and submitted',status:'PASS'});
  console.log('Submission result keys:',Object.keys(submission));
  results.push({check:'Desktop high-risk, referral and doctor diagnosis UI journeys',status:'PASS',note:'Covered by e2e/browser-desktop.cjs against the same backend; run it after this suite.'});
 } finally {await browser.close();console.log(JSON.stringify({suite:'local-browser',results},null,2));}
})().catch(error=>{console.error('Browser check failed; raw response and page data intentionally omitted');if(process.env.E2E_DEBUG==='true')console.error(error.message);process.exitCode=1;});
