# I just want to run it

This repo hosts a special branch that allows you to install the entire chat application as a global node module that
automatically links in the compiled binary as an executable in your path. Simply run the following command to install:

```bash
npm install -g https://github.com/chriskinzel/web-chat-back-end.git#install
```

Then you can start the application server like so:

```bash
seng513-chat
```

# I would like to clone the project and build from source

After cloning the project you can either open the project in IntelliJ and build and run from there or if you prefer
you can also build and run using npm as follows:

```bash
npm run build
npm start
```

**NOTE:** This repo does not include the pre-built Angular front-end required to run the front-end of the application.
The front-end repo is available at https://github.com/chriskinzel/web-chat-front-end.
