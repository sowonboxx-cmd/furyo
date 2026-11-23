const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:1500}});
await p.goto('file://'+process.cwd()+'/fin.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
for(const id of ['ig','og']) await (await p.$('#'+id)).screenshot({path:'fin-'+id+'.jpg',type:'jpeg',quality:90});await b.close()})();
