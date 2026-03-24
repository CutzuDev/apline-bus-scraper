import {
  Options as ChromeOptions,
  ServiceBuilder,
} from "selenium-webdriver/chrome";
import { Builder, Browser, By } from "selenium-webdriver";
import type { StationData, LineMetadata } from "./types";

const CHROMEDRIVER_PATH =
  process.env.CHROMEDRIVER_PATH || "/usr/bin/chromedriver";

function buildChromeOptions(): ChromeOptions {
  const options = new ChromeOptions();
  options.addArguments(
    "--headless",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-default-apps",
    "--disable-sync",
    "--disable-logging",
    "--disable-permissions-api",
    "--disable-notifications",
    "--disable-infobars",
    "--disable-translate",
    "--mute-audio",
    "--no-first-run",
    "--window-size=1280,720"
  );
  return options;
}

function buildDriver(options: ChromeOptions) {
  const service = new ServiceBuilder(CHROMEDRIVER_PATH);
  return new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .setChromeService(service)
    .build();
}

export async function scrapeLineMetadata(
  masterUrl: string
): Promise<LineMetadata> {
  const driver = await buildDriver(buildChromeOptions());

  try {
    await driver.get(masterUrl);

    // Get line name from frame 2 (MainFrame)
    await driver.switchTo().frame(2);
    const linie = await driver
      .findElement(By.id("linia_web"))
      .findElement(By.tagName("b"))
      .getText();

    // Switch back to main content then to frame 1 for station list
    await driver.switchTo().defaultContent();
    await driver.switchTo().frame(1);

    // Get all station elements
    const stationElements = await driver.findElements(
      By.css(".list_sus_active, .list_statie, .list_jos")
    );

    const stations: StationData[] = [];

    for (const station of stationElements) {
      const boldElement = await station.findElement(By.tagName("b"));
      const stationName = await boldElement.getText();

      const linkElement = await station.findElement(By.tagName("a"));
      const href = await linkElement.getAttribute("href");

      const stationLinkName = stationName
        .toLowerCase()
        .replace(/\./g, "")
        .replace(/\s+/g, "-");

      stations.push({ route: stationLinkName, name: stationName, link: href });
    }

    return { lineName: linie, stations };
  } finally {
    await driver.quit();
  }
}

export async function scrapeBusTimes(url: string): Promise<string[]> {
  const driver = await buildDriver(buildChromeOptions());

  try {
    await driver.get(url);

    const table = await driver.findElement(By.id("tabel2"));
    const hoursElements = await table.findElements(
      By.css("#web_class_hours")
    );
    const minutesWrapperElements = await table.findElements(
      By.css("#web_class_minutes")
    );

    const hourTexts = await Promise.all(
      hoursElements.map((el) => el.getText())
    );
    const minuteTextsByHour = await Promise.all(
      minutesWrapperElements.map(async (wrapper) => {
        const minuteElements = await wrapper.findElements(By.css("#web_min"));
        return Promise.all(minuteElements.map((el) => el.getText()));
      })
    );

    const busTimes: string[] = [];
    hourTexts.forEach((hour, i) => {
      if (minuteTextsByHour[i]) {
        minuteTextsByHour[i].forEach((minute) => {
          busTimes.push(`${hour.trim()}:${minute.trim()}`);
        });
      }
    });

    return busTimes;
  } finally {
    await driver.quit();
  }
}
