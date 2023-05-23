# Chrome Extension

# TODOs
- Need to trigger on [active tab](https://developer.chrome.com/docs/extensions/mv3/manifest/activeTab/). Currently fires for whatever last loaded tab was vs. the one viewing.
- Implement react for better UI. Good [article](https://medium.com/@ramez.aijaz/build-simple-chrome-extension-from-scratch-using-react-bootstrap-babel-and-webpack-374f97bdafde) that creates simple react based extension.
- Add login with Firebase
- Refactor code per [this](https://dev.to/paulasantamaria/chrome-extensions-reusing-code-3f1g) article.

## Summary

The extension has the following parts:
- mainfest.json - the file Chrome uses to know what parts to load, behaviour etc
- content.js - the script that runs in the page where it can access the DOM. This is identified in the "content_scripts" section of the manifest
- background.js - the script that is run in the context of the extension. It takes the message from content.js and saves the content to local storage. It cannot access the DOM. It is identified in the "background" section of the manifest.
- popup.js - main JS file that contains the logic for retrieving the data from storage as saved from background, sending dathe data to the function and rendering the results back to the user.
- Webpack. Only local JS files can be executed in an extension. Thus all scripts need to be locally present. Used webpack to capture all such dependencies using popup.js as the entry point it uses to find files to pull in locally. Still copy other main scripts directly to folders.

## Articles

The following articles were helpful in undestanding how to implement this.

https://developer.chrome.com/docs/extensions/mv3/content_scripts/
"Content scripts are files that run in the context of web pages. By using the standard Document Object Model (DOM), they are able to read details of the web pages the browser visits, make changes to them, and pass information to their parent extension."

https://thoughtbot.com/blog/how-to-make-a-chrome-extension
https://dev.to/paulasantamaria/chrome-extensions-local-storage-1b34

Firebase Authentication
https://firebaseopensource.com/projects/firebase/quickstart-js/auth/chromextension/readme/

Webpack
https://medium.com/@ramez.aijaz/build-simple-chrome-extension-from-scratch-using-react-bootstrap-babel-and-webpack-374f97bdafde
https://webpack.js.org/guides/getting-started/

## Dependencies
- JQuery for DOM manipulation
- [Moustache](https://www.npmjs.com/package/mustache) for dynamic template rendering
- Bootstrap for layout