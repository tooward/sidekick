Development Notes


Need to find out why Anglar Fire is causing build issues. Used this workaround but need to switch back.
https://github.com/angular/angularfire/issues/3290

Change tsconfig:

"strict": false,
"skipLibCheck": true,

If want to put this in as a bookmarklet need to read up on the build changes that I made in Ionoi.
https://www.npmjs.com/package/@angular-devkit/build-angular

Good article on drag & drop in Angular materials
https://developers.google.com/codelabs/building-a-web-app-with-angular-and-firebase#9

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