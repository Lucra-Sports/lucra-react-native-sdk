/**
 * Press button helper, something is wrong with iOS on detox, the button is correctly detected but calling .tap tries to tap on a totally different coordinate.
 * As a workaround we get the button location and then call a global device.tap at the correct coordinates.
 *  */

const SANDBOX_PHONE = process.env.DETOX_SANDBOX_PHONE;
const SANDBOX_CODE = process.env.DETOX_SANDBOX_CODE;

const pressButton = async (label) => {
  const el = element(by.label(label)).atIndex(0);
  await waitFor(el).toBeVisible().withTimeout(3000);
  await expect(el).toBeVisible();
  let attributes = await el.getAttributes();
  if (attributes.elements) {
    attributes = attributes.elements[0];
  }
  const point = {
    x: Math.floor(attributes.activationPoint.x),
    y: Math.floor(attributes.activationPoint.y),
  };
  await device.tap(point);
  return point;
};

/**
 * Checkbox helper when the label is detached from the actual button, it tries to find the label and tap a few points to the left.
 * As a workaround we get the button location and then call a global device.tap at the correct coordinates.
 *  */
const pressCheckbox = async (label) => {
  const el = element(by.label(label));
  await expect(el).toBeVisible();
  const attributes = await el.getAttributes();
  await device.tap({
    x: Math.floor(attributes.frame.x - 10),
    y: Math.floor(attributes.frame.y),
  });
};

describe(':ios:Lucra RN SDK', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { location: 'always' },
    });
  });

  it('should be able to create a matchup', async () => {
    await element(by.text(/sheet flows/i)).tap();
    await element(by.text(/create games matchup/i)).tap();
    await expect(element(by.label(/phone number/i))).toBeVisible();
    await element(by.type('UITextField')).typeText(SANDBOX_PHONE);
    await element(by.type('UITextField')).tapReturnKey();
    await pressCheckbox(/^this feature is powered by Lucra.*/i);
    const point = await pressButton(/CONTINUE/i);
    await expect(element(by.label(/confirmation code/i))).toBeVisible();
    await element(by.type('UITextField')).atIndex(0).typeText(SANDBOX_CODE);
    await element(by.type('UITextField')).atIndex(0).tapReturnKey();
    await device.tap(point);
    await pressButton(/let's play*./i);
    await device.tap(point);
    await pressButton(/irl game name/i);
    await pressButton(/^create.*matchup$/i);
    await pressButton(/add opponent/i);
    await waitFor(element(by.label(/invite your opponent.*/i)))
      .toBeVisible()
      .withTimeout(60000);
    await pressButton(/done/i);
  });
});
