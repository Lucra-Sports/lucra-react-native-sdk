import { Platform, UIManager, ViewProps, findNodeHandle } from 'react-native';
import { default as LucraFlowViewNative } from './LucraFlowViewComponent';
import React, { useEffect } from 'react';

const createFragment = (viewId: number, name: string) => {
  UIManager.dispatchViewManagerCommand(
    viewId,
    //@ts-expect-error
    UIManager.LucraFlowView.Commands.create.toString(),
    [viewId, name]
  );
};

export const LucraFlowView: React.FC<ViewProps & { name: string }> = (
  props
) => {
  const ref = React.useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const viewId = findNodeHandle(ref.current);
      createFragment(viewId!, props.name);
    }
  });

  if (Platform.OS === 'ios') {
    return <LucraFlowViewNative {...props} />;
  } else {
    return (
      <LucraFlowViewNative style={props.style} ref={ref} name={props.name} />
    );
  }
};
