const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pressButton = async (label) => {
  const el = element(by.label(label)).atIndex(0);
  await waitFor(el).toBeVisible().withTimeout(3000);
  await expect(el).toBeVisible();
  let attributes = await el.getAttributes();
  console.log(attributes);
  if (attributes.elements) {
    attributes = attributes.elements[0];
    console.log(attributes);
  }
  const point = {
    x: Math.floor(attributes.activationPoint.x),
    y: Math.floor(attributes.activationPoint.y),
  };
  await device.tap(point);
  return point;
};

const pressCheckbox = async (label) => {
  const el = element(by.label(label));
  await expect(el).toBeVisible();
  const attributes = await el.getAttributes();
  await device.tap({
    x: Math.floor(attributes.frame.x - 10),
    y: Math.floor(attributes.frame.y),
  });
};

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp({
      // permissions: { location: 'always' },
    });
  });

  beforeEach(async () => {
    await device.setOrientation('portrait');
  });

  it('should have SDK Navigation', async () => {
    await element(by.text('Sheet Flows')).tap();
    await element(by.text('Create Games Matchup')).tap();
    await expect(element(by.label('Phone Number'))).toBeVisible();
    await element(by.type('UITextField')).typeText('5555550103');
    await element(by.type('UITextField')).tapReturnKey();
    await pressCheckbox(/^This feature is powered by Lucra.*/i);
    const point = await pressButton(/CONTINUE/i);
    await expect(element(by.label('Confirmation Code'))).toBeVisible();
    await element(by.type('UITextField')).atIndex(0).typeText('123456');
    await element(by.type('UITextField')).atIndex(0).tapReturnKey();
    await device.tap(point);
    await pressButton("Let's play!");
    await device.tap(point);
    await pressButton(/irl game name/i);
    await pressButton(/^create.*matchup$/i);
    await pressButton(/add opponent/i);
    await expect(element(by.text(/invite your opponent!/i))).toBeVisible();
    await pressButton(/done/i);
    await expect(element(by.text(/matchup created!/i))).toBeVisible();
  });
});
