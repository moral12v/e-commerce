import 'dotenv/config';

/***************************
    SERVER PORT CONFIGRATIONS
***************************/

export const APP_ENV = process.env.hasOwnProperty('APP_ENV') ? process.env.APP_ENV : 'local';
export const PORT = process.env.hasOwnProperty('PORT') ? process.env.PORT : '2024';
export const JWT_SECRET_TOKEN = process.env.hasOwnProperty('JWT_SECRET_TOKEN')
  ? process.env.JWT_SECRET_TOKEN
  : '32c103437dbee3dae37dcbe8cd459226fc47bbd9942e335c088a9ecbf908fe8fa7f828e4c8c354e1bf07f3ac2c084610b3e83d18a91b65e390ee83231312eefb';
// export const JWT_EXPIRES_IN = process.env.hasOwnProperty('JWT_EXPIRES_IN') ? process.env.JWT_EXPIRES_IN : '24h';
export const JWT_EXPIRES_IN = '30d';

export const CRYPTO_SECRET_KEY = process.env.hasOwnProperty('CRYPTO_SECRET_KEY') ? process.env.CRYPTO_SECRET_KEY : '';

/***************************
    DATABASE CONFIGRATIONS
***************************/

export const DB_HOST = process.env.hasOwnProperty('DB_HOST') ? process.env.DB_HOST : '127.0.0.1';
export const DB_PORT = process.env.hasOwnProperty('DB_PORT') ? process.env.DB_PORT : '27017';
export const DB_NAME = process.env.hasOwnProperty('DB_NAME') ? process.env.DB_NAME : 'gamlewala';
export const SEEDER_PASSWORD = process.env.hasOwnProperty('SEEDER_KEY') ? process.env.SEEDER_KEY : 'Gamla@2024';

/***************************
    MAILER CONFIGRATIONS
***************************/
export const MAILER_EMAIL = 'gamlewale@gmail.com';
// export const MAILER_EMAIL = process.env.hasOwnProperty('MAILER_EMAIL') ? process.env.MAILER_EMAIL : 'softfix20@gmail.com';
export const MAILER_PASSWORD = 'rnnfptoorcjbiytz';
// export const MAILER_PASSWORD = process.env.hasOwnProperty('MAILER_PASSWORD') ? process.env.MAILER_PASSWORD : 'iizxzimqieymkqkm';

/***************************
    ORDER CONFIGRATIONS
***************************/
export const FIRST_ORDER_ID_PREFIX = process.env.hasOwnProperty('FIRST_ORDER_ID_PREFIX')
  ? process.env.FIRST_ORDER_ID_PREFIX
  : 'ORDER';

export const FIRST_ORDER_ID_POSTFIX = process.env.hasOwnProperty('FIRST_ORDER_ID_POSTFIX')
  ? process.env.FIRST_ORDER_ID_POSTFIX
  : '00001';

export const FIRST_INVOICE_ID_PREFIX = process.env.hasOwnProperty('FIRST_INVOICE_ID_PREFIX')
  ? process.env.FIRST_INVOICE_ID_PREFIX
  : 'GAMLEWALA';

export const FIRST_INVOICE_ID_POSTFIX = process.env.hasOwnProperty('FIRST_INVOICE_ID_POSTFIX')
  ? process.env.FIRST_INVOICE_ID_POSTFIX
  : '00001';

/***********************************
    PAYMENY GATEWAY CONFIGRATIONS
***********************************/

export const RAZORPAY_KEY_ID = process.env.hasOwnProperty('RAZORPAY_KEY_ID') ? process.env.RAZORPAY_KEY_ID : null;

export const RAZORPAY_KEY_SECRET = process.env.hasOwnProperty('RAZORPAY_KEY_SECRET')
  ? process.env.RAZORPAY_KEY_SECRET
  : null;

/************************************
  FIREBASE SERVER KEY CONFIGRATIONS
************************************/

export const FIREBASE_CLIENT_EMAIL = process.env.hasOwnProperty('FIREBASE_CLIENT_EMAIL') ? process.env.FIREBASE_CLIENT_EMAIL : 'firebase-adminsdk-f6s66@gamlevala-customer.iam.gserviceaccount.com';

export const FIREBASE_PRIVATE_KEY = process.env.hasOwnProperty('FIREBASE_PRIVATE_KEY') ? process.env.FIREBASE_PRIVATE_KEY : "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCVlRPpN066vgWr\n0qrV4NqrokrqUb4AKfR1bg+wfGtUydjk83B5lTgFIxnSdx8VlqotxIC/4gOqOJPK\nSr6u+B26KlikirvV+to+o8C6c+zTR/Jj21VWKQspZeI0/8i5zjp2UvfLEpnrNS8B\nPNJ5l0XV9zaiO2buikiMaYJF+y8X51S5G6huNbacJrncL9p0ybel5g87yNs6A7QV\n8/VGTEXpSStfoQ/tcHYwfTiSCHDva8ewuFo0j03h4ZKttBVgn2wSxkLYxoSspdxN\nJhn+hrlX96MhqLyvHSB0YmJRo0q3D2AWrJOpGsNUZx0T6vulwwyTihgfH1BJpHiC\nHCrjHVufAgMBAAECggEAFSnlCcu1+2z0T3W8jwtD1SHeuJ19JPfKqyy50o4f/3yZ\nj/czlDg9F1j6h9Er2DmbdWNGlh+LxjNAEdCWfxoC1rq0FP++CM33wAIaPCc3vEMD\nNAat4cVn22EbasU/6K4ZjnE5twU4OtOpBWNOIj75dgcGt1hxPVHaZudss6sQ5DAy\n4nsCx66IUvZ6jk6ncv6bzILS5BAzLIkt7Ph7DdwN7M4+//8qSbieFbpBT2RGKLhs\nzh1WDOfFdgGTGXeXN5VYNh9JqG7EA/0tfsYqK3YPA9obxNyuJYkt6rhFwtPuaa8k\ni/NGD5QOv7IG8LgkdqxBPiCC/8YFbBIBMSqnYP+PaQKBgQDJWVqc0guFqzS0HJEB\ngUQinCq6KaBhHN+kHvmfnwQcBh9seHl9ZEeX0IG6t78I9nxoVYWS7NAsFyspMKfC\njgp+MlDL/rTsUlxHXX/cPFOEwY1YmNB54OJCtoSF//IvxrGhqp2T772Mo2u/lJ+o\nlpBK3QaQQ9EeTv23EQWprchyuQKBgQC+LrzwNAfYlIuNjAOuNYvFrlEKzqAK/zCO\naFrW6DpZ/DoU3oIwg85jF+alaWEe1mwNRme9pusIgjKiOQsI3kzEJb4RIs40Q8f5\nWYKEcl0aHQtz2fzUBTsdr49pWr36W5GLe1hJEfhrcbkg7l/07udxZyx2t7s3Q3wU\nVOPbCtD1FwKBgQCeuiIEnlEW/vB9TEfDt/POlO3Z9BbKd8iVyRVgECtdLDZ5fD/J\n6dPGiki6uT+QAT/xv/mc6bLyDxGnVwPpC7CZ63BmYFSgOA0m9T5mj+gHL84Nmeo/\nKlkz3k56lFqH70r491dh2AzFYc7/KFr0vDzjx3n1IIEqM3svZevg526tgQKBgBOV\nwpVF9mziV0C7Y4GkOAGiguwG/UpEn1569qfdAG1V4TFW/Lc8S5u+0VzFbl/7muL/\nFh3cu6WDqu0zzKQcKHGmpV0kZXHSbRyLkDpNgLL4vL4we63l4AGdm7owwxGuLl3b\n1OqpdBi0fGkcwzr5A1KVWmnbX+dABt4dI93hzkT/AoGAHbgG6IAwj+5ZAg/MTTT6\nX/ESGANrPx+BkJgAx2hQrlPdY9+MBjyAJbwZ7J2s9Tem+bpecjxvig3s0qVwLSZi\nNglXXmviNLEr9e+OadOgMlU5Y81eBLCfbj8qyVngQHdcXLVJKx1den3yDREgaZMH\nBZozLGmTjevgRqTO3k+MUX4=\n-----END PRIVATE KEY-----\n"
