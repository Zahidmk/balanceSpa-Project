import db from '../config/db.js';

const Facility = {
  getAll: () => db.query('SELECT * FROM facilities ORDER BY id DESC'),
  getById: (id) => db.query('SELECT * FROM facilities WHERE id = ?', [id]),
  create: (data) => db.query('INSERT INTO facilities SET ?', [data]),
  update: (id, data) => db.query('UPDATE facilities SET ? WHERE id = ?', [data, id]),
  delete: (id) => db.query('DELETE FROM facilities WHERE id = ?', [id]),
};

export default Facility;
