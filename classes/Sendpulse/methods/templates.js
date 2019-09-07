module.exports = [
  ['POST', 'template', 'create'],
  ['POST', 'template/edit/{{id}}', 'edit'],
  ['GET', 'templates', 'get'],
  ['GET', 'template/{{id}}', 'getOne'],
  ['GET', 'templates/{{lang}}', 'getByLang']
];
