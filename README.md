# rubik-sendpulse
Sendpulse's Bot API kubik for the Rubik

## Install

### npm
```bash
npm i rubik-sendpulse
```

### yarn
```bash
yarn add rubik-sendpulse
```

## Use
```js
const { App, Kubiks } = require('rubik-main');
const Sendpulse = require('rubik-sendpulse');
const path = require('path');

// create rubik app
const app = new App();
// config need for most modules
const config = new Kubiks.Config(path.join(__dirname, './config/'));

const sendpulse = new Sendpulse();

app.add([ config, sendpulse ]);

app.up().
then(() => console.info('App started')).
catch(err => console.error(err));
```

## Config
`sendpulse.js` config in configs volume may contain the host, an id and a secret.

If you do not specify a host, then `https://api.sendpulse.com/` will be used by default.

If you don't specify an id and a secret, you will need to pass it when create kubik.

You may need the host option if for some reason Sendpulse host is not available from your server
and you want to configure a proxy server.


For example:
`config/sendpulse.js`
```js
module.exports = {
  host: 'https://my.sendpulse.proxy.example.com/'
};
```

## Call
All methods are grouped by namespaces.

List of available methods and namespaces you can see in `classes/Sendpulse/methods/`

```js
...
const response = await app.sendpulse.addressbooks.get();
...
const createResponse = await app.sendpulse.addressbooks.createEmails([{
  email,
  variables: {
    ping: 'pong',
    hello: 'world'
  }
}]);
````

## Extensions
Sendpulse kubik doesn't has any extension.
