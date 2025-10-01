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

describe(':ios:Lucra RN SDK', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { location: 'always' },
    });
  });

  it('should be able to create a matchup', async () => {
    // TODO - this specific flow is already captured by Autosana.
    // We can revisit this automation more for the headless side of things.
    // await element(by.text(/sheet flows/i)).tap();
    // await element(by.text(/create games matchup/i)).tap();
    // const phoneNumberInput = element(by.type('UITextField')).atIndex(0);
    // await waitFor(phoneNumberInput).toBeVisible().withTimeout(5000);
    // await phoneNumberInput.replaceText(SANDBOX_PHONE);
    // await phoneNumberInput.tapReturnKey();
    // const point = await pressButton(/CONTINUE/i);
    // await expect(element(by.label(/confirmation code/i))).toBeVisible();
    // await element(by.type('UITextField')).atIndex(0).typeText(SANDBOX_CODE);
    // await element(by.type('UITextField')).atIndex(0).tapReturnKey();
    // await device.tap(point);
    // await pressButton(/let's play*./i);
    // await device.tap(point);
    // await pressButton(/irl game name/i);
    // await pressButton(/^create.*matchup$/i);
    // await pressButton(/add opponent/i);
    // await waitFor(element(by.label(/invite your opponent.*/i)))
    //   .toBeVisible()
    //   .withTimeout(60000);
    // await pressButton(/done/i);
  });
});
