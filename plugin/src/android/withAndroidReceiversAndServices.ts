import { AndroidConfig, AndroidManifest } from '@expo/config-plugins';

const { getMainApplicationOrThrow } = AndroidConfig.Manifest;

export function withAndroidReceiversAndServices(
  androidManifest: AndroidManifest
): AndroidManifest {
  const mainApplication = getMainApplicationOrThrow(androidManifest);

  mainApplication.receiver = [
    ...(mainApplication.receiver ?? []),
    {
      '$': {
        'android:name':
          'com.geocomply.client.GeoComplyClientBootBroadcastReceiver',
        'android:enabled': 'true',
        'android:exported': 'true',
      },
      'intent-filter': [
        {
          action: [
            { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
            {
              $: { 'android:name': 'android.intent.action.QUICKBOOT_POWERON' },
            },
          ],
        },
      ],
    },
    {
      $: {
        'android:name': 'com.geocomply.client.GeoComplyClientBroadcastReceiver',
      },
    },
  ];

  mainApplication.service = [
    ...(mainApplication.service ?? []),
    {
      $: {
        'android:name':
          'com.geocomply.location.WarmingUpLocationProvidersService',
        'android:exported': 'false',
      },
    },
    {
      $: {
        'android:name': 'com.geocomply.security.GCIsolatedSecurityService',
        'android:exported': 'false',
        // @ts-expect-error ts(2322)
        'android:isolatedProcess': 'true',
        'tools:targetApi': 'q',
      },
    },
  ];

  return androidManifest;
}
