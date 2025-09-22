import { codegenNativeComponent } from 'react-native';
import type { HostComponent } from 'react-native';
import type { ViewProps } from 'react-native';

interface NativeProps extends ViewProps {}

export default codegenNativeComponent<NativeProps>(
  'LucraProfilePill'
) as HostComponent<NativeProps>;
