let express = require('express');
let router = express.Router();

let Sequelize = require('sequelize');
var Keeps, Unfollows, Starts;

var sequelize = new Sequelize('database', process.env.DB_USER, process.env.DB_PASS, {
  host: '0.0.0.0',
  dialect: 'sqlite',
  pool: {
    max: 999999,
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
  return Keeps.findAll({
    where: {
      user_id: user_id
    }
  }).then(results => {
    return results.map(r => r.get({plain:true}).kept_id);
  })
};

let getUnfollows = (user_id) => {
  return Unfollows.findAll({
    where: {
      user_id: user_id
    }
  }).then(results => {
    return results.map(r => r.get({plain:true}).unfollowed_id);
  })
};

let getStartCount = (user_id) => {
  return Starts.findOne({
    where: {
      user_id: user_id
    }
  }).then(result => {
    return result ? result.get({plain:true}).start_count : null;
  })
};

// Load progress
router.get("/data/progress", (req, res) => {
  console.log('loading progress')
  let kept_promise = new Promise((resolve) =>  {
    getKeeps(req.session.userId).then(r => {
      resolve(r);
    });
  });

  let unfollowed_promise = new Promise((resolve) =>  {
    getUnfollows(req.session.userId).then(r => {
      resolve(r);
    });
  });
  
  let start_count_promise = new Promise((resolve) =>  {
    getStartCount(req.session.userId).then(r => {
      resolve(r);
    });
  });
  
  Promise.all([
    kept_promise, unfollowed_promise, start_count_promise
  ]).then(result => {
    console.log(result)
    if (result[0] == undefined &&
        result[1] == undefined &&
        result[2] == undefined) {
      res.send({
        status: 404
      });
    } else {
      res.send({
        status: 200,
        kept_ids: result[0] || [],
        unfollowed_ids: result[1] || [],
        start_count: result[2] || null
      });
    }
  });
});

let saveStartCount = (user_id, start_count) => {
  Starts.findCreateFind({
    where: { user_id: user_id },
    defaults: { start_count: start_count }
  }).spread((result, created) => {
    console.log('saved start count');
    return result.get({plain:true}).start_count;
  });
};

// Expects kept_ids = [STR, ...], unfollowed_ids = [STR, ...], start_count = INT
router.post("/data/progress/save", (req, res) => {
  let user_id = req.session.userId,
      kept_ids = req.body.kept_ids,
      unfollowed_ids = req.body.unfollowed_ids,
      start_count = req.body.start_count;

  console.log('saving', kept_ids, unfollowed_ids, start_count);
  
  // Find all in db, then remove the dupes, then bulkCreate
  let kept_promise = new Promise((resolve) => {
    getKeeps(user_id).then(r => {
      let new_ids = kept_ids
        .filter(id => !r.includes(id))
        .map(id => {
          return {
            user_id: user_id,
            kept_id: id
          }
        });
      Keeps.bulkCreate(new_ids)
        .then(() => getKeeps(user_id))
        .then(ids => resolve(ids));
    });
  });
  let unfollowed_promise = new Promise((resolve) => {
    getUnfollows(user_id).then(r => {
      let new_ids = unfollowed_ids
        .filter(id => !r.includes(id))
        .map(id => {
          return {
            user_id: user_id,
            kept_id: id
          }
        });
      Unfollows.bulkCreate(new_ids)
        .then(() => getUnfollows(user_id))
        .then(ids => resolve(ids));
    });
  });

  let start_count_promise = new Promise((resolve, reject) => {
    saveStartCount(user_id, Number(start_count))
      .then(result => resolve(result));
  });
  
  Promise.all([
    kept_promise, unfollowed_promise, start_count_promise
  ]).then(results => {
    console.log('saved', results);
    res.send({
      status: 200
    });
  });
});

module.exports = router;