import { db } from '../db.js';
import jwt from 'jsonwebtoken';
import StatusCodes from 'http-status-codes';
import crypto from 'crypto';

export async function login(req, res) {
  const { email, password } = req.body;

  const query = `select * from member where email = ?`;
  const values = [email];

  try {
    const conn = await db;
    const results = await conn.query(query, values);

    const loginMember = results[0];
    const encryptedPassword = crypto
      .pbkdf2Sync(password, loginMember.salt, 10000, 10, 'sha512')
      .toString('base64');

    if (loginMember && loginMember.password === encryptedPassword) {
      const token = createJwtToken(loginMember.email);

      res.cookie('token', token, {
        httpOnly: true,
      });
      console.log(token);

      return res.status(StatusCodes.OK).json({
        token,
        name: loginMember.name,
      });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Bad Request',
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Bad Request',
    });
  }
}

export async function register(req, res) {
  const { email, password, name } = req.body;

  const salt = crypto.randomBytes(10).toString('base64');
  const encryptedPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, 'sha512')
    .toString('base64');

  const query = `insert into member (email, password, name, salt) values (?, ?, ?, ?)`;
  const values = [email, encryptedPassword, name, salt];

  try {
    const conn = await db;
    const results = await conn.query(query, values);
    console.log(results);
    const token = createJwtToken(email);
    return res.status(StatusCodes.CREATED).json({
      token,
      name,
    });
  } catch (err) {
    console.log(err);
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Bad Request',
    });
  }
}

function createJwtToken(email) {
  return jwt.sign({ email }, process.env.PRIVATE_KEY, {
    expiresIn: '1h',
    issuer: 'hightuv',
  });
}
