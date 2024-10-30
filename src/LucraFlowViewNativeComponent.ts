import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { HostComponent } from 'react-native';
import type { ViewProps } from 'react-native';

interface NativeProps extends ViewProps {
  flow: string;
}

export default codegenNativeComponent<NativeProps>(
  'LucraFlowView'
) as HostComponent<NativeProps>;
