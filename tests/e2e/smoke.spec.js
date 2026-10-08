import {test,expect} from '@playwright/test';

const publicRoutes=['/','/marketplace/','/marketplace/general.html','/marketplace/inmobiliaria.html','/tienda/','/vehiculos/','/inmobiliaria/','/servicios/','/asesoria/','/financiacion/','/contacto/','/legal/aviso-legal.html','/legal/privacidad.html','/legal/cookies.html','/legal/terminos.html'];

for(const route of publicRoutes){
  test('public route '+route,async({page})=>{
    const response=await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });
}

test('home security headers and account modal',async({page})=>{
  const response=await page.goto('/');
  expect(response?.headers()['x-content-type-options']).toBe('nosniff');
  expect(response?.headers()['x-frame-options']).toBe('DENY');
  expect(response?.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin');
  await page.locator('#btnCuenta').click();
  await expect(page.locator('#modalCuenta')).toHaveClass(/active/);
});

test('account hash opens modal',async({page})=>{
  await page.goto('/#cuenta');
  await expect(page.locator('#modalCuenta')).toHaveClass(/active/);
});

test('invalid listing id handled',async({page})=>{
  await page.goto('/marketplace/anuncio.html?id=00000000-0000-0000-0000-000000000000');
  await expect(page.locator('body')).toContainText(/Anuncio no encontrado|Cargando/i);
});

test('contact form constraints',async({page})=>{
  await page.goto('/contacto/');
  await expect(page.locator('#contactForm')).toBeVisible();
  await expect(page.locator('#email')).toHaveAttribute('type','email');
  await expect(page.locator('#message')).toHaveAttribute('minlength','10');
});

for(const route of ['/perfil/','/tienda/vendedor.html','/gestion/','/notificaciones/','/vehiculos/gestionar.html','/inmobiliaria/gestionar.html','/servicios/gestionar.html']){
  test('protected route '+route,async({page})=>{
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    expect(new URL(page.url()).pathname).not.toBe(route);
  });
}

test('MFA return target stays same-origin',async({page})=>{
  await page.goto('/seguridad/?next=https%3A%2F%2Fevil.invalid%2Fphishing');
  expect(new URL(page.url()).origin).toBe(new URL(process.env.BASE_URL||'https://zeletas.netlify.app').origin);
});