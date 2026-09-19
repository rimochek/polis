// Historical workspace screenshot callback; adapt its assumptions to the authenticated application.
async (page) => {
  await page.getByRole('heading', { name: 'Магазин «Точка»' }).waitFor();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: '.impeccable/review/desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('combobox', { name: 'Страховщик', exact: true }).selectOption('1');
  if (!(await page.getByRole('button', { name: /Франшиза, Вектор Полис/ }).isVisible()))
    throw new Error('Mobile offer conditions are not accessible');
  await page.screenshot({ path: '.impeccable/review/mobile.png', fullPage: true });
  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: /Франшиза, Вектор Полис/ }).click();
  await page.getByRole('dialog').waitFor();
  await page.locator('.pdf-source[data-ready=true]').waitFor();
  await page.screenshot({ path: '.impeccable/review/source.png', fullPage: false });
  await page.getByRole('button', { name: 'Закрыть источник' }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  return { overflow };
};
