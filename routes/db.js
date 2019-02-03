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
      unfollowed_id: {
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
    Unfollows.sync()
    Starts.sync()
  })
  .catch(function (err) {
    console.log('Unable to connect to the database: ', err);
  });

let getKeeps = (user_id) => {
  Keeps.findAll({
    where: {
      user_id: user_id
    }
  }).then(results => {
    return results.map(r => r.kept_id);
  })
};

let getUnfollows = (user_id) => {
  Unfollows.findAll({
    where: {
      user_id: user_id
    }
  }).then(results => {
    return results.map(r => r.unfollowed_id);
  })
};

let getStartCount = (user_id) => {
  Starts.findOne({
    where: {
      user_id: user_id
    }
  }).then(result => {
    return result ? result.start_count : null;
  })
};

router.get("/data/progress", (req, res) => {
  let kept_promise = new Promise((resolve) =>  {
    resolve(getKeeps(req.session.userId));
  });

  let unfollowed_promise = new Promise((resolve) =>  {
    resolve(getUnfollows(req.session.userId));
  });
  
  let start_count_promise = new Promise((resolve) =>  {
    resolve(getStartCount(req.session.userId));
  });
  
  Promise.all([
    kept_promise, unfollowed_promise, start_count_promise
  ]).then(result => {
    res.send({
      status: 200,
      kept_ids: result[0],
      unfollowed_ids: result[1],
      start_count: result[2]
    });
  });
});

let saveStartCount = (user_id, start_count) => {
  Starts.findOrCreate({
    where: { user_id: user_id },
    defaults: { start_count: start_count }
  }).spread((result, created) => {
    console.log('saved start count', result, created);
    return result.start_count;
  });
};

// Expects kept_ids = [STR, ...], unfollowed_ids = [STR, ...], start_count = INT
router.post("/data/progress/save_all", (req, res) => {
  let user_id = req.session.userId,
      kept_ids = req.body.kept_ids,
      unfollowed_ids = req.body.unfollowed_ids,
      start_count = req.body.start_count;

  console.log('saving', kept_ids, unfollowed_ids);

  let kept_promises = kept_ids.map(id => {
    return new Promise((resolve, reject) => {
      Keeps.findOrCreate({
        where: { user_id: user_id },
        defaults: { kept_id: id }
      }).spread((result, created) => {
        if (created) console.log('saved keep', id)
        resolve(result);
      });
    });
  });
  
  let unfollowed_promises = unfollowed_ids.map(id => {
    return new Promise((resolve, reject) => {
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
  
  let start_promise = new Promise((resolve, reject) => {
    resolve(saveStartCount(res.session.userId, Number(start_count)));
  });
  
  Promise.all(
    kept_promises.concat(unfollowed_promises).concat(start_promise)
  ).then(results => {
    console.log('saved', results);
    res.send({
      status: 200
    });
  });
});

module.exports = router;