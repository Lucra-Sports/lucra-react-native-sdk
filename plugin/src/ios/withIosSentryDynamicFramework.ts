import { type ConfigPlugin, withPodfile } from '@expo/config-plugins';
import {
  mergeContents,
  removeGeneratedContents,
} from '@expo/config-plugins/build/utils/generateCode';

const TAG = 'lucra-sdk-sentry-dynamic-framework';
const existingPreInstallHook = /^\s*pre_install do \|(\w+)\|/m;
const firstTarget = /^\s*target\s+['"]/;

const sentryDynamicLoop = (installer: string) =>
  `  ${installer}.pod_targets.each do |pod|
    next unless pod.name == 'Sentry'
    def pod.build_type
      Pod::BuildType.dynamic_framework
    end
  end`;

// LucraSDK links Sentry's dynamic framework. The plugin forces static
// frameworks, under which the Sentry pod builds static and the app dies at
// launch with `dyld: Library not loaded: @rpath/Sentry.framework/Sentry`, so
// only the Sentry pod is switched back to a dynamic framework. CocoaPods
// allows a single `pre_install` hook per Podfile, so a hook the host defines
// is extended instead of redefined. The hook is detected on contents stripped
// of this plugin's own generated block, which is what mergeContents rewrites.
export const withIosSentryDynamicFramework: ConfigPlugin = (config) =>
  withPodfile(config, (newConfig) => {
    const contents =
      removeGeneratedContents(newConfig.modResults.contents, TAG) ??
      newConfig.modResults.contents;
    const installer = existingPreInstallHook.exec(contents)?.[1];

    newConfig.modResults.contents = installer
      ? mergeContents({
          tag: TAG,
          src: contents,
          newSrc: sentryDynamicLoop(installer),
          comment: '#',
          anchor: existingPreInstallHook,
          offset: 1,
        }).contents
      : mergeContents({
          tag: TAG,
          src: contents,
          newSrc: `pre_install do |installer|\n${sentryDynamicLoop('installer')}\nend`,
          comment: '#',
          anchor: firstTarget,
          offset: 0,
        }).contents;

    return newConfig;
  });

export default withIosSentryDynamicFramework;
