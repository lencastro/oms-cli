var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const passport = require("passport");
//const LocalStrategy = require("passport-local");
const BasicStrategy = require('passport-http').BasicStrategy
const session = require("express-session");
const FileStore = require("session-file-store")(session);
var uuid = require('uuid');
var indexRouter = require("./routes.js");

var app = express();
/*app.use(
	session({
		store: new FileStore(),
		secret: "secret",
		resave: false,
  		saveUninitialized: true,
		genid: function(req) {
			return uuid.v4() // use UUIDs for session IDs
		},
	})
);*/
app.use(passport.initialize());
app.use(passport.session());

const user = {
  id: '1',
  username: "test@email.com",
  password: 'testpwd'
}

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const _user = user.id === id ? user : false;
  done(null, _user)
})

passport.use(new BasicStrategy(
	function(username, password, done) {
		if(username === user.username && password === user.password){
			return done(null, user)
		  }else{
			return done(null, false)
		}
	}
  ));

/*passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
  if(email === user.email && password === user.password){
    return done(null, user)
  }else{
    return done(null, false)
  }
}))*/


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;