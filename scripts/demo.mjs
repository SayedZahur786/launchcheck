import {chromium} from '@playwright/test';
import {mkdir,writeFile,copyFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const base=process.env.DEMO_URL||'http://localhost:3000';
await mkdir('test-results/demo',{recursive:true});
const scenes=[
 ['You’re one link away from launch. What did you miss?','One link away from launch.\nWhat did you miss?'],
 ['Paste your public website. Launchcheck queues a real scan, with a forty five second time budget.','Paste a public URL.\nRun a real launch check.'],
 ['Get a score, and a pass or fail for every check. The report tells you exactly what was covered.','Your score. Every check.\nA clearly defined scope.'],
 ['Nine dollars unlocks evidence and next steps. Payments are not open yet in this preview.','Full report · $9 once\nPayments not open yet'],
 ['This labeled sample shows the detail. Three failures were deliberately inserted. It is not a live assessment of Wikipedia.','Sample evidence, clearly labeled.\nThree intentional failures.'],
 ['Share the free summary, or copy a score badge for your readme. Private evidence stays private.','Share the summary.\nKeep paid evidence private.'],
 ['Launchcheck. A second pair of eyes, before your first visitor.','Launchcheck\nShip with fewer surprises.']
];
const lengths=[];
for(let i=0;i<scenes.length;i++){
 const speech=spawnSync('say',['-v','Samantha','-r','165','-o',`test-results/demo/voice-${i}.aiff`,scenes[i][0]],{encoding:'utf8'});if(speech.status!==0)throw Error('Voice generation failed.');
 const probe=spawnSync('ffprobe',['-v','quiet','-show_entries','format=duration','-of','csv=p=0',`test-results/demo/voice-${i}.aiff`],{encoding:'utf8'});lengths.push(Number(probe.stdout));
}
const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:'test-results/demo',size:{width:1440,height:1000}},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();const start=Date.now();const offsets=[];
async function caption(text){await page.evaluate(text=>{document.getElementById('demo-caption')?.remove();const node=document.createElement('div');node.id='demo-caption';node.textContent=text;Object.assign(node.style,{position:'fixed',bottom:'26px',left:'50%',transform:'translateX(-50%)',width:'900px',maxWidth:'92vw',padding:'18px 26px',background:'#173b35',color:'#fff',border:'1px solid #c7f18b',borderRadius:'12px',font:'600 32px/1.3 Arial',textAlign:'center',whiteSpace:'pre-line',zIndex:'2147483647',boxShadow:'0 8px 30px #0002'});document.body.append(node);},text);}
async function scene(i,action){await action();await caption(scenes[i][1]);offsets.push((Date.now()-start)/1000);await page.waitForTimeout((lengths[i]+.55)*1000);}
await scene(0,()=>page.goto(base));
await scene(1,async()=>{await page.getByLabel('Your website or public GitHub repository').fill('https://www.wikipedia.org/');});
await page.getByRole('button',{name:'Check my launch'}).click();await page.waitForURL(/\/reports\/[a-f0-9]{32}$/);await page.getByRole('heading',{name:'Your launch checklist'}).waitFor({timeout:60000});const report=page.url();
await scene(2,async()=>{await page.screenshot({path:'docs/screenshots/live-summary-desktop.png',fullPage:true});});
await scene(3,async()=>{await page.getByRole('link',{name:'Unlock full report · $9'}).click();await page.getByRole('heading',{name:'Know what to fix. And why.'}).waitFor();await page.screenshot({path:'docs/screenshots/paywall-desktop.png',fullPage:true});});
await scene(4,async()=>{await page.goto(`${base}/reports/demo/full`);await page.evaluate(()=>window.scrollTo(0,240));});
await scene(5,async()=>{await page.goto(report);await page.getByRole('button',{name:'Copy report link'}).scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Copy report link'}).click();await page.getByRole('button',{name:'Copy badge',exact:true}).click();});
await scene(6,async()=>{await page.goto(base);});
const video=page.video();await context.close();await browser.close();const raw=await video.path();await copyFile(raw,'test-results/demo/raw.webm');
const inputs=['-i','test-results/demo/raw.webm'];for(let i=0;i<scenes.length;i++)inputs.push('-i',`test-results/demo/voice-${i}.aiff`);
const filters=offsets.map((offset,i)=>`[${i+1}:a]adelay=${Math.round(offset*1000)}:all=1[a${i}]`).join(';')+';'+offsets.map((_,i)=>`[a${i}]`).join('')+`amix=inputs=${scenes.length}:normalize=0,apad[audio]`;
const result=spawnSync('ffmpeg',['-y',...inputs,'-filter_complex',filters,'-map','0:v','-map','[audio]','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart','docs/demo.mp4'],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr.slice(-1500));
spawnSync('ffmpeg',['-y','-ss','3','-i','docs/demo.mp4','-frames:v','1','docs/demo-poster.png'],{stdio:'ignore'});
await writeFile('docs/demo-transcript.json',JSON.stringify(scenes.map((s,i)=>({start:offsets[i],duration:lengths[i],narration:s[0],caption:s[1]})),null,2));console.log('Narrated and captioned walkthrough saved to docs/demo.mp4');
