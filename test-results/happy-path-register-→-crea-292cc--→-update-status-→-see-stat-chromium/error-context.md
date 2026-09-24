# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: happy-path.spec.ts >> register → create church → add contact → update status → see stat
- Location: e2e\happy-path.spec.ts:3:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/church\/choose/
Received string:  "http://localhost:3000/register"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://localhost:3000/register"

```

```yaml
- main:
  - heading "Register" [level=1]
  - paragraph: Create your HarvestTrack account.
  - textbox "First name": Test
  - textbox "Last name": User
  - textbox "Email address": test-1785246076430@example.com
  - textbox "Password": TestPassword123!
  - button "Creating account..." [disabled]
  - link "Already have an account? Sign in":
    - /url: /login
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("register → create church → add contact → update status → see stat", async ({ page }) => {
  4  |   const uniqueEmail = `test-${Date.now()}@example.com`;
  5  |   const password = "TestPassword123!";
  6  | 
  7  |   await page.goto("/register");
  8  |   await page.getByRole("textbox", { name: "First Name" }).fill("Test");
  9  |   await page.getByRole("textbox", { name: "Last Name" }).fill("User");
  10 |   await page.getByRole("textbox", { name: "Email Address" }).fill(uniqueEmail);
  11 |   await page.getByRole("textbox", { name: "Password" }).fill(password);
  12 |   await page.getByRole("button", { name: "Create Account" }).click();
  13 | 
> 14 |   await expect(page).toHaveURL(/\/church\/choose/);
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  15 |   await page.getByRole("button", { name: "Create a New Church" }).click();
  16 | 
  17 |   await expect(page).toHaveURL(/\/church$/);
  18 |   await page.getByRole("textbox", { name: "Church Name" }).fill(`Test Church ${Date.now()}`);
  19 |   await page.getByRole("textbox", { name: "Conference / Mission" }).fill("Test Conference");
  20 |   await page.getByRole("textbox", { name: "District" }).fill("Test District");
  21 |   await page.getByRole("textbox", { name: "Location" }).fill("Test City");
  22 |   await page.getByRole("button", { name: "Save Church" }).click();
  23 | 
  24 |   await expect(page).toHaveURL(/\/dashboard/);
  25 | 
  26 |   await page.getByRole("link", { name: "Add Contact" }).click();
  27 |   await expect(page).toHaveURL(/\/contact$/);
  28 | 
  29 |   await page.getByRole("textbox", { name: "Name" }).fill("Jane Doe");
  30 |   await page.getByPlaceholder("Age").fill("34");
  31 |   await page.getByRole("textbox", { name: "Phone" }).fill("555-0100");
  32 |   await page.getByRole("textbox", { name: "Location" }).fill("Harare");
  33 |   await page.getByRole("button", { name: "Save Contact" }).click();
  34 | 
  35 |   await expect(page).toHaveURL(/\/members/);
  36 |   await expect(page.getByText("Jane Doe")).toBeVisible();
  37 | 
  38 |   await page.locator("select").first().selectOption("Preparing for Baptism");
  39 |   await expect(page.getByText("Status updated").first()).toBeVisible();
  40 | 
  41 |   await page.getByRole("link", { name: "Dashboard" }).click();
  42 |   await expect(page).toHaveURL(/\/dashboard/);
  43 |   await expect(page.getByText(/People Preparing for Baptism: 1/)).toBeVisible();
  44 | });
```