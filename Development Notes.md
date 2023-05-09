# Development Notes


# TODO:

- Use issues in repo: https://github.com/tooward/overthetop/issues
- Need to find out why Anglar Fire is causing build [issues](https://github.com/angular/angularfire/issues/32900). Used this workaround but need to switch back:
Change tsconfig: "strict": false, "skipLibCheck": true,

- If want to put this in as a bookmarklet need to read up on how to build properly for a chrome extension.
https://www.npmjs.com/package/@angular-devkit/build-angular


# Dependencies

- Bootstrap for CSS
"npm install bootstrap"
update angular.json to use )
    "styles": [
            "node_modules/bootstrap/dist/css/bootstrap.min.css",
            "src/styles.scss"
    ]

- Google Fonts (styles.css updated to leverage classes)
- Angular Fire (had issue with build, needed to run npm audit fix --force)
- NG Typed for typing text on homepage https://www.npmjs.com/package/ngx-typed-js
- Used this tutorial for Firebase Auth https://www.positronx.io/full-angular-firebase-authentication-system/. Note have to use BOTH init's for Firebase to get this to work. Need to migrate it to the new process (note the use of /compat/ in path of libraries used).

NOTES:

** Testing **
https://fireship.io/lessons/angular-testing-guide-including-firebase/
https://firebase.google.com/docs/rules/unit-tests
"the normal Firebase Authentication flow does not work. Instead, you can use the initializeTestApp() method in the rules-unit-testing library, which takes an auth field. The Firebase object created using this method behaves as if it has successfully authenticated as whatever entity you provide."
https://github.com/firebase/quickstart-testing


** UI & Styles**
https://github.com/angular/flex-layout

The styling is controlled by a SCSS file that is referenced in the angular.json file. This is what enables overriding of the default stylesheet and using custom colors.
https://material.angular.io/guide/theming#using-a-pre-built-theme
Icons take their color from the 'current color' (text). Need to override this by directly controlling the color in an inline style.
https://material.angular.io/components/icon/overview

**TypeScript**
https://www.typescriptlang.org/
https://basarat.gitbook.io/typescript/

** Angular **
https://codecraft.tv/courses/angular/forms/model-driven/ (tutorial)
https://stackoverflow.com/questions/51084724/types-googlemaps-index-d-ts-is-not-a-module 

** Authentication **
https://www.techiediaries.com/angular-firebase/angular-9-firebase-authentication-email-google-and-password/

**AngularFire**
https://github.com/angular/angularfire
https://medium.com/madhash/how-to-crud-in-angular-firebase-firestore-456353d7c62
https://firebase.googleblog.com/2018/08/better-arrays-in-cloud-firestore.html // query array parameters

**Chrome Extension**
https://developer.chrome.com/extensions
Sign-in Chrome extension must whitelist
https://firebase.google.com/docs/auth/web/google-signin#authenticate_with_firebase_in_a_chrome_extension
Chrome extension with angular - 
https://medium.com/angular-in-depth/chrome-extension-with-angular-why-and-how-778200b87575
- background script must be built to not be included with compiled files
- need to add manifest to the assets
- Remove custom builder for adding packages
            "builder": "@angular-builders/custom-webpack:browser",
            "customWebpackConfig": {
              "path": "./custom-webpack.config.js"
            },

** Google Maps ** 

** Error handling module **
 - https://stackblitz.com/edit/angular-global-error-handling?file=src%2Fapp%2Fshared%2Fshared.module.ts
 - https://medium.com/@PhilippKief/global-error-handling-in-angular-ea395ce174b1 (article for ^^)

 ** Mock services **
 - https://httpstat.us/ (http error codes)

 ** Firestore **
 - https://github.com/angular/angularfire/blob/master/docs/emulators/emulators.md
 - https://dev.to/alexanderbourne/designing-data-models-for-firebase-2hcl - consider using maps instead of converting to JSON for explicit control


Emulator not release ports when shutdown. Use:
sudo lsof -i :8080 (put in correct port)
sudo kill -9 PID

=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

Naming:

Evoke: chat, 
Domains: com, chat, io, docs, us, lol, one, onl, ooo, open, red, surf, top, uno, wow, xyz, you

we.surf - $2k


-------
Sharing component behaviour:

Basic:
- On first share - user types recipients email into field.
- On submission of form, server sends out an email to the recipient with the comment, a link to the page and an invitation to join.
  [Store list of receipients in a separate document for autocomplete.]
- Next share - user can start to type the receipient email and it will autocomplete.

Next - pre-create account for user.
- Should have a user account that stores reverse of relationship.
  When user joins ensuring they can see all prior items shared with them and have those who shared with them in their friend list.
  If don't go this approach could bulid up this info by querying lists of receipients for email from existing users.