/** @format */

import { AppRegistry, Platform } from 'react-native';
import moment from 'moment';
import App from './App';
import Gleap from 'react-native-gleapsdk';
import { i18next } from './src/i18n';
import 'moment-timezone';
import 'moment/locale/es';

Gleap.initialize('P26aq9PfN8vTJNCG94pBGnLHpiabvUJ5');

const appName = Platform.select({
  ios: () => 'coJobcoreTalent',
  android: () => 'jobcore',
})();

moment.locale(i18next.language);

AppRegistry.registerComponent(appName, () => App);
 
