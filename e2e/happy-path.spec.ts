import { test, expect } from "@playwright/test";

test("register → create church → add contact → update status → see stat", async ({ page }) => {
  const uniqueEmail = `test-${Date.now()}@example.com`;
  const password = "TestPassword123!";

  await page.goto("/register");
  await page.getByPlaceholder("First Name").fill("Test");
  await page.getByPlaceholder("Last Name").fill("User");
  await page.getByPlaceholder("Email").fill(uniqueEmail);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL(/\/church\/choose/);
  await page.getByRole("button", { name: "Create a New Church" }).click();

  await expect(page).toHaveURL(/\/church$/);
  await page.getByPlaceholder("Church Name").fill(`Test Church ${Date.now()}`);
  await page.getByPlaceholder("Conference / Mission").fill("Test Conference");
  await page.getByPlaceholder("District").fill("Test District");
  await page.getByPlaceholder("Location").fill("Test City");
  await page.getByRole("button", { name: "Save Church" }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByRole("link", { name: "Add Contact" }).click();
  await expect(page).toHaveURL(/\/contact$/);

  await page.getByPlaceholder("Name").fill("Jane Doe");
  await page.getByPlaceholder("Age").fill("34");
  await page.getByPlaceholder("Phone").fill("555-0100");
  await page.getByPlaceholder("Location").fill("Harare");
  await page.getByRole("button", { name: "Save Contact" }).click();

  await expect(page).toHaveURL(/\/members/);
  await expect(page.getByText("Jane Doe")).toBeVisible();

  await page.locator("select").first().selectOption("Preparing for Baptism");
  await expect(page.locator("select").first()).toHaveValue("Preparing for Baptism");

  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(/People Preparing for Baptism: 1/)).toBeVisible();
});