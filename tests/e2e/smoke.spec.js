import {test,expect} from '@playwright/test';

const publicPages=['/','/marketplace/general.html','/marketplace/vehiculos.html','/marketplace/inmobiliaria.html','/marketplace/servicios.html','/tienda/','/vehiculos/','/inmobiliaria/','/servicios/','/asesoria/','/financiacion/','/contacto/'];
const protectedPages=['/perfil/','/tienda/vendedor.html','/tienda/editar-producto.html','/vehiculos/gestionar.html','/inmobiliaria/gestionar.html','/servicios/gestionar.html','/mis-anuncios/','/mis-vehiculos/','/mi-inmobiliaria/','/mis-servicios/','/gestion/','/notificaciones/'];

test('public pages load without uncaught browser errors',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  for(const path of publicPages){await page.goto(path,{waitUntil:'domcontentloaded'});await expect(page.locator('body')).toBeVisible()}
  expect(errors).toEqual([]);
});

test('primary protected pages redirect anonymous users',async({page})=>{
  for(const path of protectedPages){await page.goto(path,{waitUntil:'networkidle'});await expect(page).not.toHaveURL(new RegExp(path.replace(/[.*+?^$\{\}()|[\]\\]/g,'\\$&')+'$'))}
});

test('contact form is usable and security honeypot exists',async({page})=>{
  await page.goto('/contacto/');await expect(page.locator('#contactForm')).toBeVisible();await expect(page.locator('#email')).toHaveAttribute('type','email');await expect(page.locator('#website')).toHaveAttribute('tabindex','-1');
});

test('security headers are active on the live site',async({request})=>{
  const response=await request.get('/');expect(response.ok()).toBeTruthy();const h=response.headers();expect(h['x-content-type-options']).toBe('nosniff');expect(h['x-frame-options']).toBe('DENY');expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
});

test('sensitive Edge Functions reject anonymous callers',async({request})=>{
  const base='https://sbqpkfdcznulwpxlxiwu.supabase.co/functions/v1/';
  for(const fn of ['stripe-checkout','store-create','store-onboarding','media-upload','start-conversation','report-content','admin-console','delete-account']){
    const response=await request.post(base+fn,{data:{}});expect(response.status(),fn).toBeGreaterThanOrEqual(401);expect(response.status(),fn).toBeLessThan(500);
  }
});

test('security verification page renders',async({page})=>{
  await page.goto('/seguridad/?next=%2Fperfil%2F');await expect(page).toHaveTitle(/Verificación/i);await expect(page.locator('#code')).toBeVisible();
});
