import { test, expect } from "@playwright/test"
import "dotenv/config"

const rawEmail = process.env.LOGIN_EMAIL ?? ""
const rawPassword = process.env.LOGIN_PASSWORD ?? ""

const LOGIN_EMAIL = rawEmail.replace(/['";]/g, "").trim()
const LOGIN_PASSWORD = rawPassword.replace(/['";]/g, "").trim()

test.describe("Fluxos de autenticação usando usuário do .env", () => {
  test.beforeAll(() => {
    if (!LOGIN_EMAIL || !LOGIN_PASSWORD) {
      throw new Error("LOGIN_EMAIL e LOGIN_PASSWORD precisam estar definidos no .env para rodar estes testes.")
    }
  })

  test("Tela de cadastro abre e mostra formulário completo", async ({ page }) => {
    await page.goto("/register")
    await expect(page).toHaveURL(/\/register/)

    const nameInput = page.getByLabel("Nome Completo")
    const emailInput = page.getByLabel("Email")
    const passwordInput = page.locator("#password")
    const confirmPasswordInput = page.locator("#confirm-password")
    const userTypeSelect = page.getByLabel("Tipo de Usuário")

    await expect(userTypeSelect).toBeVisible()
    await expect(nameInput).toBeVisible()
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(confirmPasswordInput).toBeVisible()

    const screenshotPath = `tests/screenshots/register-form-${Date.now()}.png`
    await page.screenshot({ path: screenshotPath, fullPage: true })
  })

  test("Login com usuário definido no .env redireciona para /perfil ou /admin", async ({ page, request }) => {
    const registerResponse = await request.post("/register", {
      form: {
        userType: "user",
        name: "Usuário Env",
        email: LOGIN_EMAIL,
        password: LOGIN_PASSWORD,
        "confirm-password": LOGIN_PASSWORD,
      },
    })

    if (!registerResponse.ok() && registerResponse.status() !== 400) {
      throw new Error(`Falha ao criar usuário de teste do .env: status ${registerResponse.status()}`)
    }

    await page.goto("/login")

    await page.locator("#email").fill(LOGIN_EMAIL)
    await page.locator("#password").fill(LOGIN_PASSWORD)

    await Promise.all([
      page.waitForURL((url) => url.pathname === "/perfil" || url.pathname === "/admin", { timeout: 15_000 }),
      page.getByRole("button", { name: /Entrar/i }).click(),
    ])

    const finalUrl = page.url()
    const isPerfil = finalUrl.includes("/perfil")
    const isAdmin = finalUrl.includes("/admin")

    expect(isPerfil || isAdmin).toBeTruthy()

    const screenshotPath = `tests/screenshots/login-env-user-${Date.now()}.png`
    await page.screenshot({ path: screenshotPath, fullPage: true })
  })
})
