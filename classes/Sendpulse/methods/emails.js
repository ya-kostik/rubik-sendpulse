module.exports = [
  ['GET', 'emails', 'get'],
  ['GET', 'emails/{{email}}', 'getOne'],
  ['GET', 'emails/{{email}}/details', 'getDetails'],
  ['POST', 'emails', 'getBulk'],
  ['DELETE', 'emails/{{email}}', 'remove'],
  ['GET', 'emails/{{email}}/campaigns', 'getCampaigns'],
  ['POST', 'emails/campaigns', 'getCampaignsBulk']
];
