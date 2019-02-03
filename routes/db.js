let express = require('express');
let router = express.Router();

let Sequelize = require('sequelize');
var Keeps, Starts;

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
    Starts = sequelize.define('starts', {
      user_id: {
        type: Sequelize.STRING
      },
      start_count: {
        type: Sequelize.INTEGER
      }
    });
    
    Keeps.sync()
    Starts.sync()
  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });

// router.get("/data/keeps", (req, res) => {
//   var dbKeeps=[];
//   Keeps.findAll().then((rows) => {
//     res.send(rows.map(r => [r.user_id,r.kept_id]));
//   });
// });

router.get("/data/keeps/:user_id", (req, res) => {
  Keeps.findAll({
    where: {
      user_id: req.params.user_id
    }
  }).then(results => {
    res.send(results.map(r => r.kept_id));
  })
});

router.post("/data/keeps", (req, res) {
  Keeps.create({ user_id: req.query.user_id, kept_id: req.query.kept_id});
  response.sendStatus(200);
});

router.get("/data/starts/:user_id", (req, res) => {
  Starts.findAll({
    where: {
      user_id: req.params.user_id
    }
  }).then(results => {
    res.send(results.map(r => r.start_count));
  })
});

router.post("/data/starts", function (request, response) {
  Keeps.create({ user_id: request.query.user_id, start_count: request.query.start_count});
  response.sendStatus(200);
});