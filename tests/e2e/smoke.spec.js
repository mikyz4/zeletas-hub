import {test,expect} from '@playwright/test';
test('home loads and exposes primary navigation',async({page})=>{await page.goto('/');await expect(page).toHaveTitle(/ZELETAS HUB/i);await expect(page.getByText('Marketplace',{exact:true}).first()).toBeVisible();});
test('marketplace public page loads',async({page})=>{await page.goto('/marketplace/general.html');await expect(page).toHaveURL(/marketplace\/general/);await expect(page.getByText(/Marketplace General/i)).toBeVisible();});
test('contact form is usable',async({page})=>{await page.goto('/contacto/');await expect(page.locator('#contactForm')).toBeVisible();await expect(page.locator('#email')).toHaveAttribute('type','email');});
test('protected profile redirects anonymous users',async({page})=>{await page.goto('/perfil/');await page.waitForLoadState('networkidle');await expect(page).not.toHaveURL(/\/perfil\/?$/);});
test('security verification page loads',async({page})=>{await page.goto('/seguridad/?next=%2Fperfil%2F');await expect(page).toHaveTitle(/Verificación/i);});
