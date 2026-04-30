import { expect, test } from "@playwright/test";
import { getModelDisplay, getTemperatureDisplay } from "@/client/helpers";
import { AssistantModel, AssistantTemperature } from "@/client/types/assistant";

test.describe("Chat Page Model and Temperature Combinations", () => {
  test("should return correct response for selected model and temperature", async ({
    page,
  }) => {
    const expectedResponse = "Test received! How can I assist you today?";
    await page.route("http://localhost:8000/api/v1/chat", async (route) => {
      const request = route.request();
      const body = request.postDataJSON();

      expect(body.model).toBe(AssistantModel.MINI);
      expect(body.temperature).toBe(AssistantTemperature.DETERMINISTIC);
      expect(body.messages.at(-1).parts).toEqual([
        { type: "text", text: "test message" },
      ]);

      await route.fulfill({
        body: expectedResponse,
        contentType: "text/plain; charset=utf-8",
        status: 200,
      });
    });

    await page.goto("/chat");

    // Verify the initial assistant message is present
    await expect(
      page.getByText("Hi, I am a chat bot. How can I help you today?")
    ).toBeVisible();

    // Set the model and temperature (using selectors or any UI interaction method you have)
    // These are placeholder selectors; adjust according to your actual component structure
    await page.getByRole("button").first().click();
    await page
      .getByRole("menuitem", {
        name: getModelDisplay(AssistantModel.MINI),
        exact: true,
      })
      .click();
    await page.getByRole("button").nth(1).click();
    await page
      .getByRole("menuitem", {
        name: getTemperatureDisplay(AssistantTemperature.DETERMINISTIC),
        exact: true,
      })
      .click();
    await page.getByPlaceholder("Type your message...").click();
    // Send a user message
    await page.getByPlaceholder("Type your message...").click();
    await page.getByPlaceholder("Type your message...").fill("test message");
    await page.locator("form").getByRole("button").click();

    await expect(page.getByText(expectedResponse)).toBeVisible();
  });
});
