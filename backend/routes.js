
const express = require('express');
const passport = require('passport');
const router = express.Router();
const fs = require("fs");

function jsonReader(filePath, cb) {
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      const object = JSON.parse(fileData);
      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res, next) => {
  res.render('login')
})

router.post('/login',
  passport.authenticate('basic', { session: false }),
  function(req, res, next) {
    res.json(req.user);
});

router.post('/:root/:cxt',
  passport.authenticate('basic', { session: false }),
  function(req, res, next) {
    let {cxt=''} = req.params;
    let {orderId=''} = req.body;
    if(!orderId){
      res.json([]);
    }
    jsonReader(`./db/${cxt}.json`, (err, data) => {
      if (err) {
        res.json([]);
        return;
      }
      let updated = false
      data = data.map(obj => {
        if (obj.orderId === orderId) {
          updated = true
          return {...obj, ...req.body }
        }
        return obj
      })
      if (!updated) {
        data.push({...req.body})
      }
      fs.writeFile(`./db/${cxt}.json`, JSON.stringify(data), err => {
        if (err) {
          res.json([]);
          return;
        } else {
          res.json(data);
        }
      })
    });
});

router.post('/:root/:cxt', function (req, res) {
  
  let {cxt=''} = req.params;
  let {orderId=''} = req.body;
  if(!orderId){
    res.json([]);
  }
  jsonReader(`./db/${cxt}.json`, (err, data) => {
    if (err) {
      res.json([]);
      return;
    }
    let updated = false
    data = data.map(obj => {
      if (obj.orderId === orderId) {
        updated = true
        return {...obj, ...req.body }
      }
      return obj
    })
    if (!updated) {
      data.push({...req.body})
    }
    fs.writeFile(`./db/${cxt}.json`, JSON.stringify(data), err => {
      if (err) {
        res.json([]);
        return;
      } else {
        res.json(data);
      }
    })
  });

})


router.get('/:root/:cxt',
  passport.authenticate('basic', { session: false }),
  function(req, res, next) {
    let {cxt=''} = req.params;
    jsonReader(`./db/${cxt}.json`, (err, data) => {
      if (err) {
        res.json([]);
        return;
      }
      res.json(data);
    });
});


router.get('/:root/:cxt/:id',
  passport.authenticate('basic', { session: false }),
  function(req, res, next) {
    let {cxt='', id=''} = req.params;
    jsonReader(`./db/${cxt}.json`, (err, data) => {
      if (err) {
        res.json([]);
        return;
      }
      let ret  = data.filter(o => o.orderId == id);
      res.json(ret);
    });
});


router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/")
})

module.exports = router;