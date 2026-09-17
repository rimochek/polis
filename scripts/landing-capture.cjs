async page => {
 await page.goto('http://127.0.0.1:5175/');await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.fonts.ready);await page.locator('.human-image img').scrollIntoViewIfNeeded();await page.locator('.human-image img').evaluate(img=>img.decode());await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:'.impeccable/review/landing-desktop.png',fullPage:true});await page.screenshot({path:'.impeccable/review/landing-hero.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'.impeccable/review/landing-mobile.png',fullPage:true});await page.screenshot({path:'.impeccable/review/landing-mobile-hero.png'});
 const narrow=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:innerWidth,table:document.querySelector('.compare table').getBoundingClientRect().width,container:document.querySelector('.compare-scroll').getBoundingClientRect().width}));
 await page.getByRole('combobox',{name:'Предложение страховщика'}).selectOption('0');if(!await page.getByRole('button',{name:/Франшиза, Орбита Страхование/}).isVisible())throw new Error('Compact mobile picker failed');
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));return {narrow};
}
