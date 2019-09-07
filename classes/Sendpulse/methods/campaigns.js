module.exports = [
  ['POST', 'campaigns', 'create'],
  ['PATCH', 'campaigns', 'edit'],
  ['GET', 'campaigns', 'get'],
  ['DELETE', 'campaigns/{{id}}', 'remove'],
  ['GET', 'campaigns/{{id}}', 'getOne'],
  ['GET', 'campaigns/{{id}}/email/{{email}}', 'getEmail'],
  ['GET', 'campaigns/{{id}}/countries', 'getCountries'],
  ['GET', 'campaigns/{{id}}/referrals', 'getReferrals']
];
