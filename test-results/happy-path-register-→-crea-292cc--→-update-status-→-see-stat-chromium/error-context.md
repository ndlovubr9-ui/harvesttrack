# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: happy-path.spec.ts >> register → create church → add contact → update status → see stat
- Location: e2e\happy-path.spec.ts:3:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByPlaceholder('First Name')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - heading "Register" [level=1] [ref=e7]
      - paragraph [ref=e8]: Create your HarvestTrack account.
    - generic [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]:
          - textbox "First Name" [ref=e12]:
            - /placeholder: " "
          - generic [ref=e13]: First Name
        - generic [ref=e14]:
          - textbox "Last Name" [ref=e15]:
            - /placeholder: " "
          - generic [ref=e16]: Last Name
      - generic [ref=e17]:
        - textbox "Email Address" [ref=e18]:
          - /placeholder: " "
        - generic [ref=e19]: Email Address
      - generic [ref=e20]:
        - textbox "Password" [ref=e21]:
          - /placeholder: " "
        - generic [ref=e22]: Password
      - button "Create Account" [ref=e23]
  - button "Open Next.js Dev Tools" [ref=e29] [cursor=pointer]:
    - img [ref=e30]
  - alert [ref=e33]
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
> 8  |   await page.getByPlaceholder("First Name").fill("Test");
     |                                             ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  9  |   await page.getByPlaceholder("Last Name").fill("User");
  10 |   await page.getByPlaceholder("Email").fill(uniqueEmail);
  11 |   await page.getByPlaceholder("Password").fill(password);
  12 |   await page.getByRole("button", { name: "Create Account" }).click();
  13 | 
  14 |   await expect(page).toHaveURL(/\/church\/choose/);
  15 |   await page.getByRole("button", { name: "Create a New Church" }).click();
  16 | 
  17 |   await expect(page).toHaveURL(/\/church$/);
  18 |   await page.getByPlaceholder("Church Name").fill(`Test Church ${Date.now()}`);
  19 |   await page.getByPlaceholder("Conference / Mission").fill("Test Conference");
  20 |   await page.getByPlaceholder("District").fill("Test District");
  21 |   await page.getByPlaceholder("Location").fill("Test City");
  22 |   await page.getByRole("button", { name: "Save Church" }).click();
  23 | 
  24 |   await expect(page).toHaveURL(/\/dashboard/);
  25 | 
  26 |   await page.getByRole("link", { name: "Add Contact" }).click();
  27 |   await expect(page).toHaveURL(/\/contact$/);
  28 | 
  29 |   await page.getByPlaceholder("Name").fill("Jane Doe");
  30 |   await page.getByPlaceholder("Age").fill("34");
  31 |   await page.getByPlaceholder("Phone").fill("555-0100");
  32 |   await page.getByPlaceholder("Location").fill("Harare");
  33 |   await page.getByRole("button", { name: "Save Contact" }).click();
  34 | 
  35 |   await expect(page).toHaveURL(/\/members/);
  36 |   await expect(page.getByText("Jane Doe")).toBeVisible();
  37 | 
  38 |   await page.locator("select").first().selectOption("Preparing for Baptism");
  39 |   await expect(page.locator("select").first()).toHaveValue("Preparing for Baptism");
  40 | 
  41 |   await page.getByRole("link", { name: "Dashboard" }).click();
  42 |   await expect(page).toHaveURL(/\/dashboard/);
  43 |   await expect(page.getByText(/People Preparing for Baptism: 1/)).toBeVisible();
  44 | });
```