async page => {
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.request.post('http://127.0.0.1:5173/api/demo/reset');await page.reload();
 await page.getByRole('heading',{name:'Магазин «Точка»'}).waitFor();
 const early=await page.request.get('http://127.0.0.1:5173/api/cases/demo/export');if(early.status()!==409)throw new Error('Export gate did not block unreviewed case');
 await page.getByRole('button',{name:/Только расхождения/}).click();
 if(await page.locator('.comparison-table tbody tr').count()!==4)throw new Error('Issue filter rows incorrect');
 await page.getByRole('button',{name:/Только расхождения/}).click();
 await page.getByRole('button',{name:/Франшиза, Вектор Полис: 1% страховой суммы/}).click();
 await page.getByRole('dialog').waitFor();
 if(!await page.locator('blockquote').textContent())throw new Error('Source quotation missing');
 await page.locator('.pdf-source[data-ready=true]').waitFor();const source=await page.locator('.pdf-source').getAttribute('data-source');
 const pdf=await page.request.get('http://127.0.0.1:5173'+source.split('#')[0]);if(pdf.status()!==200)throw new Error('PDF not served');
 await page.getByRole('textbox',{name:'Комментарий',exact:true}).fill('Проверено брокером: франшиза выше требования клиента.');
 await page.getByRole('button',{name:'Проверено, сохранить'}).click();
 await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.getByRole('tab',{name:/Уточнения/}).click();
 await page.getByRole('button',{name:/Вектор Полис/}).click();
 const text=await page.getByRole('textbox',{name:'Текст запроса'}).inputValue();if(!text.includes('Проверено брокером'))throw new Error('Clarification does not reflect edited finding');
 await page.getByRole('button',{name:'Предложение клиенту',exact:true}).click();
 if(await page.getByRole('button',{name:'Скачать предложение'}).isEnabled())throw new Error('Export enabled prematurely');
 for(const name of ['Орбита Страхование','Вектор Полис','Сфера Защита']){await page.getByLabel(`Я сверил все условия «${name}» с документами`).click();await page.waitForFunction(()=>!document.querySelector('.busy-banner'));}
 await page.getByRole('textbox',{name:'Комментарий для клиента'}).fill('Рекомендуем обсудить ограничения по товарным запасам.');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Скачать предложение'}).click();const download=await downloadPromise;await download.saveAs('artifacts/proposal-demo.html');
 const exportResponse=await page.request.get('http://127.0.0.1:5173/api/cases/demo/export');const html=await exportResponse.text();if(!html.includes('Требует уточнения')||!html.includes('Вымыш')&&!html.includes('вымышлены'))throw new Error('Export loses disclosures');
 await page.getByRole('button',{name:'Закрыть',exact:true}).click();
 await page.getByRole('button',{name:'Новая заявка',exact:true}).click();
 await page.getByLabel('Название заявки').fill('QA проверка загрузки');await page.getByLabel('Клиент',{exact:true}).fill('Тестовая компания');await page.getByRole('textbox',{name:'Требования клиента',exact:true}).fill('Страхование магазина на 12 месяцев, сумма 80 000 000 тенге, включая товарные запасы.');await page.getByRole('button',{name:'Создать заявку',exact:true}).click();await page.getByRole('dialog').waitFor({state:'hidden'});
 for(const [name,file] of [['Первый тестовый страховщик','data/demo-1.pdf'],['Второй тестовый страховщик','data/demo-2.pdf']]){
  await page.getByLabel('Название страховщика').fill(name);await page.locator('#document-file').setInputFiles(file);await page.getByRole('button',{name:'Сохранить документ'}).click();await page.waitForFunction(()=>!document.querySelector('.busy-banner'));
 }
 await page.getByRole('button',{name:'Анализировать',exact:true}).click();await page.getByRole('alert').waitFor();
 if(!(await page.getByRole('alert').textContent()).includes('OPENAI_API_KEY'))throw new Error('Missing-key failure not communicated');
 const all=await (await page.request.get('http://127.0.0.1:5173/api/cases')).json();const qa=all.find(c=>c.title==='QA проверка загрузки');if(!qa||qa.offers.length!==2||qa.analyzedRevision!==null)throw new Error('Real mode fabricated results');
 await page.request.delete('http://127.0.0.1:5173/api/cases/'+qa.id);
 await page.request.post('http://127.0.0.1:5173/api/demo/reset');
 await page.getByRole('link',{name:'Polis — открыть пример'}).click();
 await page.reload();
 return {passed:['issue filter','source PDF','editable finding','clarification draft','review/export gate','self-contained export','create case','two real PDF uploads','honest missing-key failure'],testCaseId:qa.id,pageErrors:errors};
}
