import { StatusCodes } from 'http-status-codes';
import { db } from '../db.js';

export async function getMember(req, res) {
  const { id: memberId } = req.params;

  const query = `select email, name from member where id = ?`;
  const values = [memberId];

  try {
    const conn = await db;
    const results = await conn.query(query, values);

    const findMember = results[0];

    if (findMember) {
      return res.status(StatusCodes.OK).json(findMember);
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

export function getMemberRoute(req, res) {
  res.status(400).end();
}
