# Deep Skies - Modern SPA API

An example of a simple SPA app with an API backend that uses authentication.

This demo integrates the latest changes to identity management in ASP.NET Core, specifically the new endpoints and token-based authentication. It also
demonstrates the HTTP editor for API interactions directly within Visual Studio.

To keep up with the .NET team, check out our [team blog](https://devblogs.microsoft.com/dotnet/).

For my latest astrophotography see [DeepSkyWorkflows](https://deepskyworkflows.com/gallery).

All images are (c) 2023 by me, Jeremy Likness, and are available for use with attribution. You have my explicit permission to download and use them for non-commercial use, including in personal screen savers and desktop backgrounds.

## Getting started

The repo contains the SQLite database pre-populated so you should be able to build and run it "out of the box.". 

If you need to rebuild the database for any reason, run the included `deepskies` and it will regenerate the database. For example, you may want to update 
the login scenario to use your own email address and password.

Copy the `gallery.sqlite3` file somewhere and reference it in `applicationsettings.json`.

## Demo preparation steps

1. Make sure login `div` is hidden with `style="display:none"` and collapsed in the UI
1. The `index.html` page is first
1. The `gallery.js` app is next, scrolled to the `init` method at the bottom
1. The `Program.cs` is open with the auth pieces hidden (highlight, `CTRL+M CTRL+H`)
1. The `DeepSkyData.cs` is open with the typed tasks showing
1. The `DeepSkyPersonalData.cs` file is open 
1. Always restart the app between demos to clear the in-memory identity database
1. Navigate to "developer tools (F12)" then "Application" and "Storage" to click "Clear site data" to get rid of cookies

## Suggested demo flow

### APIs 

1. Show the app running
1. Filter on galaxies
1. Filter on nebulae
1. Click on an item that has coordinates
1. Explain some of the details and the "celestial address" 			
1. Tap on the link to show on the Microsoft Research World Wide Telescope
1. Open dev tools (F12) and click on network
1. Clear the filters and show the request
1. Open the `gallery.js` file and scroll to the `init` method to show the fetch requests
1. Open the `Program.cs` file and show the configuration, explain how endpoints can be grouped
1. Open the `DeepSkyData.cs` file and show the typed tasks
1. Navigate up to the mapping
1. Show syntax highlighting for routes
1. Show code completion for constraints
1. Show analyzer
1. Explain how the endpoint explorer helps navigate APIs in your project
1. Show the .http file and make some example requests

### Identity

1. Explain the observation location and privacy concerns
1. Remove "display:none" from the login `div`
1. Show the login screen	
1. Show failed attempt at observation location
1. Explain that registration isn't built yet in the UI but can easily be done with the API
1. Run the API to register 
1. Show problem details explaining password policy
1. Add '!' and register
1. In the app, login with the wrong password
1. Login with the correct password	
1. On M13-florissant show the observation link 
1. Show the call failing in the .http file
1. Explain why we supported tokens for clients like mobile or even Visual Studio
1. Use the login in the .http file to get a token		
1. Paste the token into the `@accessToken` variable	
1. Now run the observation link and show it returns a link you can cut and paste to navigate to


