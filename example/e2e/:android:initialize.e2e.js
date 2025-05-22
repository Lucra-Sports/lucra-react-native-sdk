jest.setTimeout(30000);

describe(':android:Lucra RN SDK', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { location: 'always' },
    });
  });

  it('should initialize and launch the SDK', async () => {
    await element(by.text(/sheet flows/i)).tap();
    await element(by.text(/create.games.matchup/i)).tap();
    // Jetpack is not exposing the components correctly, the test will only evaluate if the screen was loaded
    const test = await element(
      by.type('androidx.compose.ui.platform.ComposeView')
    ).getAttributes();
    console.log(test);
  });
});
