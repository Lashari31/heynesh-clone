import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://heynesh.com/', { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(6000);

const read = () =>
  page.evaluate(() => {
    const d = document.querySelector('.faq.w-dropdown');
    const t = d.querySelector('.faq-toggle');
    const l = d.querySelector('.faq-list');
    const icon = d.querySelector('.faq-icon-v-line');
    const cs = getComputedStyle(l);
    return {
      dropdownCls: d.className,
      toggleCls: t.className,
      listCls: l.className,
      listInline: l.getAttribute('style'),
      listDisplay: cs.display,
      listHeight: cs.height,
      listRect: l.getBoundingClientRect().height,
      dropdownRect: d.getBoundingClientRect().height,
      iconTransform: icon ? getComputedStyle(icon).transform : null,
      iconOpacity: icon ? getComputedStyle(icon).opacity : null,
    };
  });

await page.evaluate(() => document.querySelector('#faq').scrollIntoView());
await page.waitForTimeout(1500);
console.log('CLOSED:', JSON.stringify(await read(), null, 1));

await page.click('.faq.w-dropdown .faq-toggle');
await page.waitForTimeout(300);
console.log('\nMID-OPEN (300ms):', JSON.stringify(await read(), null, 1));
await page.waitForTimeout(1500);
console.log('\nOPEN:', JSON.stringify(await read(), null, 1));
await page.screenshot({ path: '_research/shots/orig/faq-open-1440.png' });

await page.click('.faq.w-dropdown .faq-toggle');
await page.waitForTimeout(1500);
console.log('\nCLOSED AGAIN:', JSON.stringify(await read(), null, 1));

await browser.close();
