let express = require('express');
let router = express.Router();

let Sequelize = require('sequelize');
var Keeps, Unfollows, Starts;

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
    Unfollows = sequelize.define('unfollows', {
      user_id: {
        type: Sequelize.STRING
      },
      unfollow_id: {
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

router.get("/data/keeps/", (req, res) => {
  Keeps.findAll({
    where: {
      user_id: req.session.userId
    }
  }).then(results => {
    res.send({
      status: 200,
      kept_ids:results.map(r => r.kept_id)
    });
  })
});

router.get("/data/unfollows/", (req, res) => {
  Unfollows.findAll({
    where: {
      user_id: req.session.userId
    }
  }).then(results => {
    res.send({
      status: 200,
      unfollowed_ids:results.map(r => r.unfollowed_id)
    });
  })
});

// Expects kept_ids = [STR, ...], unfollowed_ids = [STR, ...]
router.post("/data/progress/save_all", (req, res) => {
  let kept_ids = req.body.kept_ids,
      unfollowed_ids = req.body.unfollowed_ids;

  console.log('saving', kept_ids, unfollowed_ids);

  let kept_promises = new Promise((resolve, reject) => {
    kept_ids.map(id => {
      Keeps.findOrCreate({
        where: {
          user_id: req.session.userId
        },
        defaults: {
          kept_id: id
        }
      }).spread((result, created) => {
        if (created) console.log('saved keep', id)
        resolve(result);
      });
    });
  });
  
  let unfollowed_promises = new Promise((resolve, reject) => {
    unfollowed_ids.map(id => {
      Unfollows.findOrCreate({
        where: {
          user_id: req.session.userId
        },
        defaults: {
          unfollowed_id: id
        }
      }).spread((result, created) => {
        if (created) console.log('saved unfollow', id)
        resolve(result);
      });
    });
  });
  
  Promise.all(kept_promises.concat(unfollowed_promises)).then(results => {
    console.log('saved', results);
    res.send({
      status: 200,
      kept_ids: results.map(r => r.kept_id)
    });
  });
});

// Expects unfollow_ids = [STR, ...]
router.post("/data/keeps/save_all", (req, res) => {
  let ids = req.body.unfollowed_ids;
  console.log('saving', ids);
  let promises = new Promise((resolve, reject) => {
    ids.map(id => {
      Keeps.findOrCreate({
        where: {
          user_id: req.session.userId
        },
        defaults: {
          kept_id: id
        }
      }).spread((result, created) => {
        if (created) console.log('saved', id)
        resolve(result);
      });
    });
  });
  
  Promise.all(promises).then(results => {
    console.log('saved', results);
    res.send({
      status: 200,
      kept_ids: results.map(r => r.kept_id)
    });
  });
});

router.get("/data/starts", (req, res) => {
  Starts.findOne({
    where: {
      user_id: req.session.userId
    }
  }).then(result => {
    if (result == null) {
      return res.send({status: 404})
    }
    res.send({
      status: 200,
      start_count: result.start_count
    });
  })
});

// Expects start_count = INT
router.post("/data/starts/save", (req, res) =>{
  Keeps.findOrCreate({
    where: {
      user_id: req.session.userId
    },
    defaults: {
      start_count: Number(req.body.start_count)
    }
  }).spread((result, created) => {
    console.log('start count saved', result, created);
    res.send({
      status: 200,
      start_count: result.start_count
    });
  });
});

module.exports = router;