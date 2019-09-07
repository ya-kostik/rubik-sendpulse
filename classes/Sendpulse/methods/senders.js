module.exports = [
  ['GET', 'senders', 'get'],
  ['POST', 'senders', 'create'],
  ['DELETE', 'senders', 'remove'],
  ['POST', 'senders/{{email}}/code', 'activate'],
  ['GET', 'senders/{{email}}/code', 'sendCode']
];
