async page => {
 const origin='https://polis-broker-demo.vercel.app';const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(origin);if(response.status()!==200)throw new Error('Landing unavailable');
 await page.getByRole('heading',{name:'Разные полисы. Ясный выбор.'}).waitFor();
 await page.locator('.human-image img').scrollIntoViewIfNeeded();await page.locator('.human-image img').evaluate(img=>img.decode());
 await page.getByRole('link',{name:'Посмотреть в деле',exact:true}).click();await page.getByRole('heading',{name:'Попробуйте Polis в работе.'}).waitFor();
 if(!page.url().endsWith('/demo.html'))throw new Error('Wrong demo URL');await page.reload();await page.getByRole('heading',{name:'Попробуйте Polis в работе.'}).waitFor();
 await page.getByRole('button',{name:/Франшиза, Вектор Полис/}).click();await page.getByRole('dialog').waitFor();
 const href=await page.getByRole('link',{name:/Открыть PDF/}).getAttribute('href');if(!href.endsWith('#page=2'))throw new Error('Wrong PDF page anchor');
 const pdf=await page.request.get(origin+href);if(pdf.status()!==200||!pdf.headers()['content-type'].includes('pdf'))throw new Error('Missing deployed PDF');await page.getByRole('button',{name:'Условие проверено'}).click();
 const exportButton=page.getByRole('button',{name:'Скачать пример предложения'});if(await exportButton.isEnabled())throw new Error('Missing export gate');
 for(const name of ['Орбита Страхование','Вектор Полис','Сфера Защита'])await page.getByRole('checkbox',{name:`Я сверил все условия «${name}»`}).check();
 const wait=page.waitForEvent('download');await exportButton.click();const file=await wait;if(!file.suggestedFilename().endsWith('.html'))throw new Error('Invalid download');
 await page.goto(origin);await page.setViewportSize({width:390,height:844});await page.getByRole('combobox',{name:'Предложение страховщика'}).selectOption('2');if(!await page.getByRole('button',{name:/Франшиза, Сфера Защита/}).isVisible())throw new Error('Mobile picker failed');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw new Error('Mobile overflow');
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));return {url:origin,status:response.status(),passed:['published landing','image decode','demo navigation','direct demo refresh','source page anchor','PDF download','review gate','HTML export','mobile comparison'],pageErrors:errors};
}
