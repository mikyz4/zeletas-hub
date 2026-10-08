import { test, expect } from '@playwright/test';

const publicRoutes=['/','/marketplace/','/marketplace/general.html','/marketplace/inmobiliaria.html','/marketplace/vehiculos.html','/tienda/','/vehiculos/','/inmobiliaria/','/servicios/','/asesoria/','/financiacion/','/contacto/','/legal/aviso-legal.html','/legal/privacidad.html','/legal/cookies.html','/legal/terminos.html'];

test('public routes return HTTP 200 and have no broken images',async({page,request})=>{
 for(const route of publicRoutes){
  const response=await request.get(route);
  expect(response.status(),route).toBe(200);
  await page.goto(route);
  await expect(page.locator('body')).toBeVisible();
  const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src')));
  expect(broken,route).toEqual([]);
 }
});

test('home exposes primary navigation',async({page})=>{await page.goto('/');await expect(page).toHaveTitle(/ZELETAS HUB/i);await expect(page.getByText('Marketplace',{exact:true}).first()).toBeVisible()});
test('marketplace public page loads',async({page})=>{await page.goto('/marketplace/general.html');await expect(page).toHaveURL(/marketplace\/general/);await expect(page.getByText(/Marketplace General/i)).toBeVisible()});
test('contact form is usable',async({page})=>{await page.goto('/contacto/');await expect(page.locator('#contactForm')).toBeVisible();await expect(page.locator('#email')).toHaveAttribute('type','email')});
test('protected routes redirect anonymous users',async({page})=>{for(const route of ['/perfil/','tienda/vendedor.html','vehiculos/gestionar.html','inmobiliaria/gestionar.html','servicios/gestionar.html','notificaciones/','gestion/']){await page.goto(route);await page.waitForLoadState('domcontentloaded');await expect(page).not.toHaveURL(new RegExp(route.replace(/[.*+?^$()|[\]\\]/g,'\\$&')+'$'))}});
test('MFA screen rejects external next target',async({page})=>{await page.goto('/seguridad/?next=https%3A%2F%2Fevil.example%2F');await expect(page).toHaveURL(/zeletas\.netlify\.app\/seguridad/);});
test('sitemap and robots exist',async({request})=>{expect((await request.get('/robots.txt')).status()).toBe(200);expect((await request.get('/sitemap.xml')).status()).toBe(200)});
