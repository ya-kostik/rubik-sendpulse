/* global describe test expect */
const path = require('path');
const { createApp, createKubik } =  require('rubik-main/tests/helpers/creators');
const isString = require('lodash/isString');

const { Kubiks: { Config } } = require('rubik-main');
const Sendpulse = require('../classes/Sendpulse');

const CONFIG_VOLUMES = [
  path.join(__dirname, '../default/'),
  path.join(__dirname, '../config/')
];

const get = () => {
  const app = createApp();
  app.add(new Config(CONFIG_VOLUMES));
  const kubik = createKubik(Sendpulse, app);
  return { app, kubik };
}

describe('Кубик Сендпульса', () => {
  test('Создается и подключается в App без проблем', () => {
    const app = createApp();
    const kubik = createKubik(Sendpulse, app);

    expect(app[kubik.name]).toBe(kubik);
    expect(app.get(kubik.name)).toBe(kubik);
  });

  test('Поднимается без ошибок', async () => {
    const { app } = get();
    await app.up();
    await app.down();
  });

  test('Выполняет запрос на получение токена без ошибок (не забудьте добавить в конфиг id и secret)', async () => {
    const { app, kubik } = get();
    await app.up();

    const token = await kubik.requestToken();
    expect(isString(token)).toBe(true);

    await app.down();
  });

  test('Получает адресные книги', async () => {
    const { app, kubik } = get();
    await app.up();

    const result = await kubik.addressbooks.get();
    expect(result).toBeInstanceOf(Array);

    await app.down();
  });

  test('Не перезапрашивает валидный токен', async () => {
    const { app, kubik } = get();
    await app.up();

    await kubik.addressbooks.get();
    expect(kubik.token).toBeDefined();
    const token = kubik.token;
    const tokenExpiresAt = kubik.tokenExpiresAt;
    await kubik.addressbooks.get();
    expect(kubik.token).toBe(token);
    expect(kubik.tokenExpiresAt).toBe(tokenExpiresAt);

    await app.down();
  });

  test('Перезапрашивает токен, который истек', async () => {
    const { app, kubik } = get();
    await app.up();

    await kubik.addressbooks.get();
    expect(kubik.token).toBeDefined();
    const token = kubik.token;
    kubik.tokenExpiresAt = Date.now() - 1000;
    await kubik.addressbooks.get();
    expect(kubik.token).not.toBe(token);

    await app.down();
  });

  test('Выстреливает ошибку при неправильном id и secret', async () => {
    const { app, kubik } = get();
    await app.up();

    kubik.id = 'invalid id';
    kubik.secret ='invalid secret';

    await expect(kubik.requestToken()).rejects.toThrow();

    await app.down();
  });

  test('Получает кампании', async () => {
    const { app, kubik } = get();
    await app.up();

    const result = await kubik.campaigns.get();
    expect(result).toBeInstanceOf(Array);

    await app.down();
  });

  test('Получает шаблоны', async () => {
    const { app, kubik } = get();
    await app.up();

    const result = await kubik.templates.get();
    expect(result).toBeInstanceOf(Array);

    await app.down();
  });

  test('Получает встроенные шаблоны сендпульса', async () => {
    const { app, kubik } = get();
    await app.up();

    const result = await kubik.templates.get({ owner: 'sendpulse' });
    expect(result).toBeInstanceOf(Array);
    expect(result.length > 0).toBe(true);

    await app.down();
  });

  test('Получает шаблоны по языку', async () => {
    const { app, kubik } = get();
    await app.up();

    const result = await kubik.templates.getByLang({ lang: 'ru' });
    expect(result).toBeInstanceOf(Array);
    expect(result.length > 0).toBe(true);

    await app.down();
  });

  test('Получает отправителей', async () => {
    const { app, kubik } = get();
    await app.up();

    const result = await kubik.senders.get();
    expect(result).toBeInstanceOf(Array);

    await app.down();
  });

  test('Не получает адрес электронной почты', async () => {
    const { app, kubik } = get();
    await app.up();

    await expect(kubik.emails.getOne({ email: 'a@example.com' })).rejects.toThrow('502: No such email');

    await app.down();
  });

  test('Получает черный список', async () => {
    const { app, kubik } = get();
    await app.up();

    const result = await kubik.blacklist.get();
    expect(result).toBeInstanceOf(Array);

    await app.down();
  });

  test('Получает баланс', async () => {
        const { app, kubik } = get();
    await app.up();

    const result = await kubik.balance.get();
    expect(result.currency).toBeDefined();

    await app.down();
  });

  test('Получает баланс по USD', async () => {
        const { app, kubik } = get();
    await app.up();

    const result = await kubik.balance.getByCurrency({ currency: 'USD' });
    expect(result.currency).toBe('USD');

    await app.down();
  });

  test('Получает детализированный баланс', async () => {
        const { app, kubik } = get();
    await app.up();

    const result = await kubik.balance.getDetailed();
    expect(result.balance).toBeDefined();

    await app.down();
  });
});
