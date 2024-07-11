import { browser, by, element, ElementFinder } from 'protractor';

export class AppPage {
  // Define element locators
  private headerElement: ElementFinder = element(by.css('app-root h1'));
  private paragraphElement: ElementFinder = element(by.css('app-root p'));

  // Navigate to the root URL
  async navigateTo(): Promise<void> {
    await browser.get('/');
  }

  // Get the text of the header element
  async getHeaderText(): Promise<string> {
    return await this.headerElement.getText();
  }

  // Get the text of the paragraph element
  async getParagraphText(): Promise<string> {
    return await this.paragraphElement.getText();
  }

  // Check if the header element is displayed
  async isHeaderDisplayed(): Promise<boolean> {
    return await this.headerElement.isDisplayed();
  }

  // Check if the paragraph element is displayed
  async isParagraphDisplayed(): Promise<boolean> {
    return await this.paragraphElement.isDisplayed();
  }

  // Get the browser title
  async getPageTitle(): Promise<string> {
    return await browser.getTitle();
  }
}