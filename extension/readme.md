The extension has the following parts:
- mainfest.json - the file Chrome uses to know what parts to load, behaviour etc
- content.js - the script that runs in the page where it can access the DOM. This is identified in the "content_scripts" section of the manifest
- background.js - the script that is run in the context of the extension. It cannot access the DOM. It is identified in the "background" section of the manifest.

https://developer.chrome.com/docs/extensions/mv3/content_scripts/
"Content scripts are files that run in the context of web pages. By using the standard Document Object Model (DOM), they are able to read details of the web pages the browser visits, make changes to them, and pass information to their parent extension."

https://thoughtbot.com/blog/how-to-make-a-chrome-extension
https://dev.to/paulasantamaria/chrome-extensions-local-storage-1b34

Firebase Authentication
https://firebaseopensource.com/projects/firebase/quickstart-js/auth/chromextension/readme/