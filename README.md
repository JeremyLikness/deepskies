# Modern SPA API

## Getting started

The repo contains the SQLite database pre-populated so you should be able to run it. If you need to rebuild, run the included `deepskies`
and it will regenerate the database. Copy it somewhere and reference in `applicationsettings.json`.

To register for auth, use the included `.http` file and run the "register" API call with a username and password. If successful, you can login 
with the UI. The database expects the username to be **jeliknes** but 
you can change that in the `deepskies` script.

In the demo the auth pieces in the main project will be remove and then added.

To see token-based, use the `.http` login method, then copy the token into the `@accessToken` variable with the surrounding quotes. You
should be able to run the observation and get a link to copy and paste into the browser.