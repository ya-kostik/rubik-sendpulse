module.exports = [
  ['POST', 'addressbooks', 'create'],
  ['PUT', 'addressbooks/{{id}}', 'edit'],
  ['DELETE', 'addressbooks/{{id}}', 'remove'],
  ['GET', 'addressbooks', 'get'],
  ['GET', 'addressbooks/{{id}}', 'getOne'],
  ['GET', 'addressbooks/{{id}}/cost', 'getCost'],
  ['GET', 'addressbooks/{{id}}/variables', 'getVariables'],
  ['GET', 'addressbooks/{{id}}/emails', 'getEmails'],
  ['GET', 'addressbooks/{{id}}/emails/total', 'getEmailsCount'],
  ['GET', 'addressbooks/{{id}}/emails/{{email}}', 'getEmail'],
  ['GET', 'addressbooks/{{id}}/variables/{{name}}/{{value}}', 'getEmailsByVariable'],
  ['POST', 'addressbooks/{{id}}/emails', 'createEmails'],
  ['DELETE', 'addressbooks/{{id}}/emails', 'removeEmails'],
  ['GET', 'addressbooks/{{id}}/campaigns', 'getCampaigns'],
  ['POST', 'addressbooks/{{id}}/emails/variable', 'editVariablesForEmail'],
  ['POST', 'addressbooks/{{id}}/emails/unsubscribe', 'unsubscribe']
];
