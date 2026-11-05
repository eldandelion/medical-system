#!/usr/bin/env node
// Real desktop/mobile UI actions against an explicitly isolated loopback backend; no mocked responses.
// Covers: teacher high-risk list + referral creation, assigned doctor diagnosis via UI,
// persistence after reload, unrelated doctor browser-level denial, student cross-role diagnosis display.
const {createRequire}=require('node:module');const {resolve}=require('node:path');const assert=require('node:assert/strict');
const puppeteer=createRequire(resolve(__dirname,'../frontend/package.json'))('puppeteer');
const origin=process.env.E2E_DESKTOP_URL,backend=process.env.E2E_BACKEND_URL,mobile=process.env.E2E_MOBILE_URL;
for(const v of [origin,backend,mobile]){const u=new URL(v);if(u.protocol!=='http:'||u.hostname!=='127.0.0.1'||u.username||u.password)throw Error('Explicit loopback targets required');}
const DIAGNOSIS='Browser E2E verified diagnosis 2026-11-02';
const results=[];const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function clickAny(page,text,selector='button, md-filled-button, md-outlined-button, md-text-button, md-menu-item, [role=button], div.cursor-pointer'){
  await page.waitForFunction(({t,s})=>[...document.querySelectorAll(s)].some(e=>e.textContent.trim().endsWith(t)),{timeout:20000},{t:text,s:selector});
  await page.evaluate(({t,s})=>{const e=[...document.querySelectorAll(s)].find(e=>e.textContent.trim().endsWith(t));if(!e)throw Error('Control absent: '+t);e.click();},{t:text,s:selector});
  await pause(400);
}
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--disable-background-networking']});
 try{
  // ---------- Desktop sessions ----------
  async function desktopSession(identifier){
   const context=await browser.createBrowserContext();const page=await context.newPage();
   await page.setViewport({width:1440,height:1000});await page.setBypassServiceWorker(true);
   await page.setRequestInterception(true);
   page.on('request',r=>{const u=new URL(r.url());return (u.origin===new URL(origin).origin||u.origin===new URL(mobile).origin)||r.url().startsWith('data:')?r.continue():r.abort();});
   await page.goto(origin);
   await page.waitForSelector('div[title][class*=rounded-full]');
   await page.click('div[title][class*=rounded-full]');await pause(300);
   await page.evaluate(()=>[...document.querySelectorAll('span')].find(e=>e.textContent==='添加其他账号').click());
   await page.waitForSelector('md-outlined-text-field');
   const input=await page.$('md-outlined-text-field >>> input');
   await input.click();
   await input.evaluate(el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true,composed:true}));});
   await page.keyboard.type(identifier,{delay:20});
   const verify=page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/api/auth/verify-identifier')&&r.request().method()==='POST',{timeout:20000});
   await page.keyboard.press('Enter');
   const verifyResponse=await verify;assert.equal(verifyResponse.status(),200,'verify-identifier failed');
   await page.waitForSelector('md-outlined-text-field[type=password]',{timeout:20000});
   const pw=await page.$('md-outlined-text-field[type=password] >>> input');
   await pw.click();
   await pw.evaluate(el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true,composed:true}));});
   await page.keyboard.type('123456',{delay:20});
   const login=page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/api/auth/login')&&r.request().method()==='POST');
   await page.keyboard.press('Enter');const response=await login;assert.equal(response.status(),200);
   await pause(1200);return {context,page};
  }
  // ---------- Mobile student session ----------
  async function mobileSession(identifier,password){
   const context=await browser.createBrowserContext();const page=await context.newPage();
   await page.setViewport({width:390,height:844});await page.setBypassServiceWorker(true);
   await page.setRequestInterception(true);
   page.on('request',r=>new URL(r.url()).origin===new URL(mobile).origin||r.url().startsWith('data:')?r.continue():r.abort());
   await page.goto(mobile);
   await page.waitForSelector('md-outlined-text-field[type=password]');
   for(const [type,value] of [['text',identifier],['password',password]])await page.$eval(`md-outlined-text-field[type=${type}]`,(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},value);
   const response=page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/api/auth/login')&&r.request().method()==='POST');
   await page.evaluate(()=>[...document.querySelectorAll('button,md-filled-button')].find(e=>e.textContent.trim().endsWith('下一步')).click());
   const login=await response;assert.equal(login.status(),200);
   await page.waitForSelector('md-navigation-tab');await pause(800);return {context,page};
  }

  // ===== 1. Teacher: high-risk list shows the freshly browser-scored student =====
  const teacher=await desktopSession('EMP-00001');
  results.push({check:'Desktop teacher real UI login',status:'PASS'});
  await clickAny(teacher.page,'高危名单');
  await teacher.page.waitForFunction(()=>document.body.innerText.includes('S2023006'),{timeout:20000});
  results.push({check:'Browser-scored student S2023006 appears in desktop high-risk list',status:'PASS'});

  // ===== 2. Teacher: create a referral for S2023006 through the form =====
  await clickAny(teacher.page,'发起转诊');
  await teacher.page.waitForSelector('md-outlined-text-field');
  // The first free-text field is 标题; the textarea is 转诊原因.
  await teacher.page.evaluate(()=>{const fields=[...document.querySelectorAll('md-outlined-text-field')];const title=fields.find(e=>e.label==='标题');if(!title)throw Error('Title field absent');title.value='Browser E2E high-risk referral';title.dispatchEvent(new Event('input',{bubbles:true}));});
  await teacher.page.evaluate(()=>{const fields=[...document.querySelectorAll('md-outlined-text-field')];const reason=fields.find(e=>e.label==='转诊原因');if(!reason)throw Error('Reason field absent');reason.value='Browser-created referral for synthetic high-risk screening';reason.dispatchEvent(new Event('input',{bubbles:true}));});
  await teacher.page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='高风险');if(!b)throw Error('Risk button absent');b.click();});
  await pause(300);
  const referralPost=teacher.page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/api/referrals')&&r.request().method()==='POST',{timeout:30000});
  await clickAny(teacher.page,'提交');
  const referralResponse=await referralPost;
  assert.ok([200,201].includes(referralResponse.status()),`Referral POST returned ${referralResponse.status()}`);
  const referral=await referralResponse.json();
  assert.ok(referral.id,'Referral response has no id');
  assert.equal(referral.studentNumber||referral.studentId&&(String(referral.studentId)==='8'? 'S2023006':undefined)||referral.studentNumber,'S2023006');
  results.push({check:'Teacher creates referral for high-risk student through desktop form',status:'PASS'});

  // ===== 3. Assigned doctor: enter SCID diagnosis through referral details UI =====
  async function doctorDiagnose(page,{expectPresent=true}={}){
   await clickAny(page,'转诊管理');
   await pause(800);
   const hasStudent=await page.evaluate(()=>document.body.innerText.includes('李明'));
   if(!expectPresent){return hasStudent;}
   assert.ok(hasStudent,'Assigned doctor cannot see his referred student');
   // Open the referral row for 李明, then the 量表数据 tab.
   await page.evaluate(()=>{const row=[...document.querySelectorAll('div.cursor-pointer')].find(r=>r.textContent.includes('李明'));if(!row)throw Error('Referral row absent');row.click();});
   await pause(800);
   await page.evaluate(()=>{const t=[...document.querySelectorAll('md-secondary-tab')].find(e=>e.textContent.trim().includes('量表数据'));if(!t)throw Error('Psychometrics tab absent');t.click();});
   await page.waitForSelector('textarea',{timeout:15000});
   await page.waitForFunction(()=>{const t=document.querySelector('textarea');return t&&!t.disabled&&t.value!==null;},{timeout:15000});
   return true;
  }
  const doctor=await desktopSession('DOC-00001');
  results.push({check:'Assigned doctor desktop login',status:'PASS'});
  await doctorDiagnose(doctor.page);
  await doctor.page.evaluate(text=>{const ta=document.querySelector('textarea');const set=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;set.call(ta,text);ta.dispatchEvent(new Event('input',{bubbles:true}));},DIAGNOSIS);
  await pause(400);
  const put=doctor.page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/health-profile')&&r.request().method()==='PUT',{timeout:30000});
  await clickAny(doctor.page,'保存诊断');
  const putResponse=await put;assert.equal(putResponse.status(),200);
  await doctor.page.waitForFunction(()=>document.body.innerText.includes('已保存'),{timeout:15000});
  results.push({check:'Assigned doctor saves SCID diagnosis through UI (PUT 200, saved indicator)',status:'PASS'});

  // ===== 4. Diagnosis persists across sessions (fresh login, server-side truth) =====
  // Note: the desktop app keeps login state in React memory only, so a plain reload resets to the
  // default student shell. Persistence is verified by logging in again and re-reading the referral.
  await doctor.page.reload({waitUntil:'domcontentloaded'});await pause(1500);
  await doctor.page.waitForSelector('div[title][class*=rounded-full]',{timeout:20000});await pause(500);
  await doctor.page.click('div[title][class*=rounded-full]');await pause(500);
  await doctor.page.evaluate(()=>[...document.querySelectorAll('span')].find(e=>e.textContent==='添加其他账号')?.click());
  await doctor.page.waitForSelector('md-outlined-text-field');
  const input2=await doctor.page.$('md-outlined-text-field >>> input');
  await input2.click();await input2.evaluate(el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true,composed:true}));});
  await doctor.page.keyboard.type('DOC-00001',{delay:20});await pause(300);
  await doctor.page.keyboard.press('Enter');
  await doctor.page.waitForSelector('md-outlined-text-field[type=password]',{timeout:20000});
  const pw2=await doctor.page.$('md-outlined-text-field[type=password] >>> input');
  await pw2.click();await pw2.evaluate(el=>{el.value='';el.dispatchEvent(new Event('input',{bubbles:true,composed:true}));});
  await doctor.page.keyboard.type('123456',{delay:20});await pause(300);
  await doctor.page.keyboard.press('Enter');await pause(2000);
  await doctorDiagnose(doctor.page);
  const persisted=await doctor.page.evaluate(()=>document.querySelector('textarea')?.value||'');
  assert.equal(persisted,DIAGNOSIS,'Diagnosis did not persist after reload');
  results.push({check:'Saved diagnosis persists across a fresh doctor login (server-side truth)',status:'PASS'});

  // ===== 5. Unrelated doctor: browser-level denial (student/referral not visible) =====
  const other=await desktopSession('DOC-00002');
  results.push({check:'Unrelated doctor desktop login',status:'PASS'});
  await clickAny(other.page,'转诊管理');
  await pause(1500);
  const sees=await other.page.evaluate(()=>document.body.innerText.includes('李明'));
  assert.equal(sees,false,'Unrelated doctor can see a referral not assigned to him');
  results.push({check:'Unrelated doctor does not see the referral or student in his UI',status:'PASS'});
  await other.context.close();

  // ===== 6. Cross-role: student sees the diagnosis on mobile =====
  const student=await mobileSession('S2023001','123457');
  results.push({check:'Referred student mobile login in separate context',status:'PASS'});
  await student.page.evaluate(()=>[...document.querySelectorAll('md-navigation-tab')].find(t=>t.label&&t.label.includes('转诊')).click());
  await student.page.waitForFunction(()=>document.body.innerText.includes('期中考试后急性焦虑'),{timeout:20000});
  await student.page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('期中考试后急性焦虑'))?.click());
  await student.page.waitForFunction(()=>document.body.innerText.includes('医生诊断'),{timeout:20000});
  await pause(800);
  const shown=await student.page.evaluate(()=>document.body.innerText);
  assert.ok(shown.includes(DIAGNOSIS),'Student mobile referral detail does not show the doctor diagnosis');
  results.push({check:'Student sees doctor diagnosis in mobile referral detail (cross-role display)',status:'PASS'});
  await student.context.close();
 } finally {
  await browser.close();
  console.log(JSON.stringify({suite:'desktop-browser',results},null,2));
 }
})().catch(e=>{console.error('Desktop browser assertion failed');if(process.env.E2E_DEBUG==='true')console.error(e.stack||e.message);process.exitCode=1;});
