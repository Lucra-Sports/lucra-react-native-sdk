import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import { initHostSentry } from './src/HostSentry';

initHostSentry();

AppRegistry.registerComponent(appName, () => App);
