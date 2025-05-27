// ─── 모듈 ───────────────────────────────────────
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// ─── 로그인 및 회원가입 컨트롤러 ──────────────────
// 로그인
const login = async (req, res) => {
    const { email, password } = req.body;

    // 이메일 또는 비밀번호 미입력 시 400
    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Bad Request1",
        });
    }

    const sql = `SELECT * FROM member WHERE email = ?`;

    conn.query(sql, [email], (err, results) => {
        // 쿼리 실행 중 에러 발생 시 400
        if (err) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Bad Request2",
            });
        }

        const loginUser = results[0];

        // 이메일이 없거나 비밀번호가 일치하지 않으면 400
        if (!loginUser || loginUser.password !== password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Bad Request3",
            });
        }

        // JWT 발급
        const token = jwt.sign(
            {
                user_id: loginUser.id,
                email: loginUser.email,
            },
            process.env.PRIVATE_KEY,
            {
                expiresIn: "30m",
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            maxAge: 1000 * 60 * 60 * 24,
        });
        // 로그인 성공 시 토큰, 사용자 이름 반환 200
        return res.status(StatusCodes.OK).json({
            token: token,
            name: loginUser.name,
        });
    });
};

// 회원가입 모듈
const register = async (req, res) => {
    const { email, password } = req.body;
    // 회원가입 실패 : email 또는 password가 없을 때
    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "이메일과 비밀번호를 입력해주세요.",
        });
    }
    // 회원가입 성공
    return res.status(StatusCodes.CREATED).json({
        message: "회원가입 성공",
        user: {
            email: email,
        },
    });
};

module.exports = { login, register };
