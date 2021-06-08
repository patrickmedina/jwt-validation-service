var Koa = require('koa');
var jwt = require('koa-jwt');
const { koaJwtSecret } = require('jwks-rsa');

const JWKS_URI = process.env.JWKS_URI || 'https://login.microsoftonline.com/common/discovery/keys';
const AUDIENCE = process.env.AUDIENCE || 'api://clientid';
const ISSUER = process.env.ISSUER || 'https://sts.windows.net/tenantid';

var app = new Koa();

// Custom 401 handling if you don't want to expose koa-jwt errors to users
app.use(function (ctx, next) {
  return next().catch((err) => {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.body = 'Protected resource, use Authorization header to get access\n';
    } else {
      throw err;
    }
  });
});

// Middleware below this line is only reached if JWT token is valid
app.use(jwt({
  secret: koaJwtSecret({
    jwksUri: JWKS_URI,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 3600
  }),
  getToken: function fromHeaderOrQuerystring(ctx) {
    if (
      ctx.headers.authorization &&
      ctx.headers.authorization.split(" ")[0] &&
      ctx.headers.authorization.split(" ")[0].toLowerCase() === "jwt"
    ) {
      return ctx.headers.authorization.split(" ")[1];
    } else if (ctx.headers.jwt) {
      return ctx.headers.jwt;
    } else if (ctx.query && ctx.query.jwt) {
      console.log('JWT from query params: ', ctx.query.jwt);
      return ctx.query.jwt;
    }
    return null;
  },
  audience: AUDIENCE,
  issuer: ISSUER
}));

// Protected middleware
app.use(function (ctx) {
  console.log('Request: ', ctx.request);
  ctx.response.status = 200;
});

app.listen(3000);
console.log('=====> JWT Verify Ready <=====');
