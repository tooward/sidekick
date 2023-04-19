// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  firebase: {
    projectId: 'covergedev',
    appId: '1:357303688739:web:545fac01e1f936efc7db96',
    storageBucket: 'covergedev.appspot.com',
    locationId: 'us-central',
    apiKey: 'AIzaSyBFF7-SbqVhFwKo468P-RTdrLrLRzqpHCE',
    authDomain: 'covergedev.firebaseapp.com',
    messagingSenderId: '357303688739',
  },
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
