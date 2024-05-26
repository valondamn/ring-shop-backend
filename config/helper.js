const MySqli = require('mysqli');

let conn = new MySqli(
  {
    host: 'localhost',
    post: 3306,
    user: 'root',
    database: 'mega_shop'
  }
);

let db = conn.emit(false); // исправлено на conn.emit(false)

module.exports = {
  database: db,
}
