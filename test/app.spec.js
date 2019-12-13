require('dotenv').config();
const app = require('../src/app');
const bs = require('../src/bookmarks-service');
const knex = require('knex');
const makeBookmarksArray = require('./bookmarks.fixtures');

describe('App', () => {
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get('/')
      .expect(200, 'Hello, world!');
  });
});

describe('bookmarks endpoints', () => {
  let db;
  let testBookmarks = makeBookmarksArray();

  before(
    'set up the connection',
    () => {
      db = knex({
        client: 'pg',
        connection:
          process.env.TEST_DB_URL
      });
      app.set('db', db);
    }
  );

  before(
    'cleanup the whole database',
    () => {
      return db('bookmarks').truncate();
    }
  );

  after('destroy connection', () => {
    return db.destroy();
  });

  describe('get /bookmarks', () => {
    context(
      'Database has data within',
      () => {
        afterEach(() => {
          return db(
            'bookmarks'
          ).truncate();
        });
        beforeEach(() => {
          db.insert(testBookmarks)
            .into('bookmarks')
            .returning('*')
            .then(function(rows) {
              console.log(
                'rows:',
                rows
              );
            });
          console.log(
            'ljdlsfjlsdjflskjfsljf'
          );
        });
        it('get all bookmarks', () => {
          return supertest(app)
            .get('/bookmarks')
            .set(
              'Authorization',
              `Bearer ${process.env.API_TOKEN}`
            )
            .expect(200, testBookmarks);
        });
      }
    );

    context(
      'Database has no data within',
      () => {
        it('get all bookmarks', () => {
          return supertest(app)
            .get('/bookmarks')
            .set(
              'Authorization',
              `Bearer ${process.env.API_TOKEN}`
            )
            .expect(200, []);
        });
      }
    );
  });

  describe('get /bookmarks/1', () => {
    context(
      'Database has data within',
      () => {
        beforeEach(() => {
          db('bookmarks_test').insert(
            testBookmarks
          );
        });
        it('get all bookmarks', () => {});
      }
    );
    context(
      'Database has no data within',
      () => {
        it('get all bookmarks', () => {
          return supertest(app)
            .get('/bookmarks/1')
            .set(
              'Authorization',
              `Bearer ${process.env.API_TOKEN}`
            )
            .expect(404, {});
        });
      }
    );
  });
});
