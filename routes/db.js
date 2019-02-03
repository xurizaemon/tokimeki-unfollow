let express = require('express');
let router = express.Router();

let Sequelize = require('sequelize');
var Keeps;

var sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  host: '0.0.0.0',
  dialect: 'sqlite',
  pool: {
    max: 100,
    min: 0,
    idle: 10000
  },
  // Security note: the database is saved to the file `database.sqlite` on the local filesystem. It's deliberately placed in the `.data` directory
  // which doesn't get copied if someone remixes the project.
  storage: '.data/database.sqlite'
});

// authenticate with the database
sequelize.authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
    // define a new table 'users'
    Keeps = sequelize.define('keeps', {
      user_id: {
        type: Sequelize.STRING
      },
      kept_id: {
        type: Sequelize.STRING
      }
    });
    
    Keeps.sync()
  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });

router.get("/data/keeps", (req, res) => {
  var dbKeeps=[];
  Keeps.findAll().then((rows) => {
    res.send(rows.map(r => [r.user_id,r.kept_id]));
  });
});

router.get("/data/keeps/:user_id", (req, res) => {
  Keeps.findAll({
    where: {
      user_id: req.params.user_id
    }
  }).then(results => {
    res.send(results.map(r => r.kept_id));
  })
});

// creates a new entry in the users table with the submitted values
router.post("/keeps", function (request, response) {
  Keeps.create({ user_id: request.query.user_id, kept_id: request.query.kept_id});
  response.sendStatus(200);
});