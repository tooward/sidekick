# Chrome Extension

# TODOs
- Need to trigger on [active tab](https://developer.chrome.com/docs/extensions/mv3/manifest/activeTab/). Currently fires for whatever last loaded tab was vs. the one viewing.
- Implement react for better UI. Good [article](https://medium.com/@ramez.aijaz/build-simple-chrome-extension-from-scratch-using-react-bootstrap-babel-and-webpack-374f97bdafde) that creates simple react based extension.
- Add login with Firebase
- Will need to implement either a template or use the tutorial above to implement webpack as only scripts that are located locally can be called in an extension. Good answer [here](https://stackoverflow.com/questions/43684452/is-it-possible-to-require-npm-modules-in-a-chrome-extension).

## Summary

The extension has the following parts:
- mainfest.json - the file Chrome uses to know what parts to load, behaviour etc
- content.js - the script that runs in the page where it can access the DOM. This is identified in the "content_scripts" section of the manifest
- background.js - the script that is run in the context of the extension. It cannot access the DOM. It is identified in the "background" section of the manifest.

## Articles

The following articles were helpful in undestanding how to implement this.

https://developer.chrome.com/docs/extensions/mv3/content_scripts/
"Content scripts are files that run in the context of web pages. By using the standard Document Object Model (DOM), they are able to read details of the web pages the browser visits, make changes to them, and pass information to their parent extension."

https://thoughtbot.com/blog/how-to-make-a-chrome-extension
https://dev.to/paulasantamaria/chrome-extensions-local-storage-1b34

Firebase Authentication
https://firebaseopensource.com/projects/firebase/quickstart-js/auth/chromextension/readme/

## Dependencies
- JQuery for DOM manipulation
- Moustache for dynamic template rendering
- Bootstrap for layout