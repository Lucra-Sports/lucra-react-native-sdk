import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent } from 'react-native';
import type { ViewProps } from 'react-native';

interface NativeProps extends ViewProps {}

export default codegenNativeComponent<NativeProps>(
  'LucraRecommendedMatchup'
) as HostComponent<NativeProps>;
