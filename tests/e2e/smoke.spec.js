import { test, expect } from '@playwright/test';

const publicRoutes=['/','/marketplace/','/marketplace/general.html','/marketplace/inmobiliaria.html','/marketplace/vehiculos.html','/tienda/','/vehiculos/','/inmobiliaria/','/servicios/','/asesoria/','/financiacion/','/contacto/','/legal/aviso-legal.html','/legal/privacidad.html','/legal/cookies.html','/legal/terminos.html'];
const protectedRoutes=['/perfil/','/tienda/vendedor.html','/vehiculos/gestionar.html','/inmobiliaria/gestionar.html','/servicios/gestionar.html','/notificaciones/','/gestion/'];

test('public routes return 200 and all images load',async({page,request})=>{
 for(const route of publicRoutes){
  const response=await request.get(route); expect(response.status(),route).toBe(200);
  await page.goto(route); await expect(page.locator('body')).toBeVisible();
  const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src')));
  expect(broken,route).toEqual([]);
 }
});

test('public assets exist',async({request})=>{
 for(const asset of ['/assets/css/styles.css','/assets/js/supabase.js','/assets/js/auth.js','/assets/js/ui.js','/assets/img/logo-zeletas.png','/manifest.json']) expect((await request.get(asset)).status(),asset).toBe(200);
});

test('security headers are present',async({request})=>{
 const h=(await request.get('/')).headers();
 expect(h['x-content-type-options']).toBe('nosniff');
 expect(h['x-frame-options']).toBe('DENY');
 expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
 expect(h['strict-transport-security']).toMatch(/max-age=/);
});

test('home and account modal work',async({page})=>{
 await page.goto('/?login=1'); await expect(page.locator('#modalCuenta')).toHaveClass(/active/);
 await expect(page.locator('#googleLoginBtn')).toBeVisible(); await expect(page.locator('#phoneLoginBtn')).toBeVisible();
});

test('marketplace and contact are usable',async({page})=>{
 await page.goto('/marketplace/general.html'); await expect(page.getByText(/Marketplace General/i)).toBeVisible();
 await page.goto('/contacto/'); await expect(page.locator('#contactForm')).toBeVisible(); await expect(page.locator('#email')).toHaveAttribute('type','email');
});

test('protected routes redirect anonymous users',async({page})=>{
 for(const route of protectedRoutes){await page.goto(route);await page.waitForLoadState('domcontentloaded');expect(new URL(page.url()).pathname,route).not.toBe(route);}
});

test('MFA gate never accepts external next target',async({page})=>{
 await page.goto('/seguridad/?next=https%3A%2F%2Fevil.example%2F'); expect(new URL(page.url()).hostname).not.toBe('evil.example');
});

test('robots and sitemap exist',async({request})=>{
 expect((await request.get('/robots.txt')).status()).toBe(200); expect((await request.get('/sitemap.xml')).status()).toBe(200);
});

test('protected Edge Functions reject unauthenticated requests',async({request})=>{
 const base='https://sbqpkfdcznulwpxlxiwu.supabase.co/functions/v1/';
 const fns=['store-create','start-conversation','report-content','delete-listing','delete-product','delete-account','media-upload','stripe-checkout','store-onboarding','admin-console'];
 for(const fn of fns){
  const response=await request.post(base+fn,{data:{}});
  expect([401,403],fn).toContain(response.status());
 }
});

test('Stripe webhook rejects unsigned external requests',async({request})=>{
 const response=await request.post('https://sbqpkfdcznulwpxlxiwu.supabase.co/functions/v1/stripe-webhook',{data:{}});
 expect([400,503]).toContain(response.status());
});

test('public media endpoint rejects unknown paths',async({request})=>{
 const response=await request.get('https://sbqpkfdcznulwpxlxiwu.supabase.co/functions/v1/media-url?path=not-a-real-media-file');
 expect([400,404]).toContain(response.status());
});
