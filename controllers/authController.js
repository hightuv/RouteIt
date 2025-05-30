// ─── 모듈 ───────────────────────────────────────
const util = require("util");
const conn = require("../mariadb");
const query = util.promisify(conn.query).bind(conn);
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// ─── 로그인 컨트롤러 ───────────────────────────
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.log("Bad Request: 누락된 필드가 있습니다.");
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ message: "Bad Request" });
    }

    try {
        const results = await query("SELECT * FROM member WHERE email = ?", [
            email,
        ]);
        const loginMember = results[0];

        if (!loginMember || loginMember.password !== password) {
            console.log("Unauthorized: 로그인 실패");
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json({ message: "Bad Request" });
        }

        return generateTokenAndRespond(res, loginMember);
        
    } catch (err) {
        console.log(`INTERNAL_SERVER_ERROR: ${err}`);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Bad Request" });
    }
};

// ─── 회원가입 컨트롤러 ─────────────────────────
const register = async (req, res) => {
    const { email, password, name } = req.body;

    // 입력값 확인
    if (!email || !password || !name) {
        console.log("Bad Request: 누락된 필드가 있습니다.");
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Bad Request",
        });
    }

    try {
        const results = await query("SELECT * FROM member WHERE email = ?", [
            email,
        ]);
        if (results.length > 0) {
            console.log("CONFLICT: 이미 존재하는 이메일입니다.");
            return res
                .status(StatusCodes.CONFLICT)
                .json({ message: "Bad Request" });
        }

        await query(
            "INSERT INTO member (email, password, name) VALUES (?, ?, ?)",
            [email, password, name]
        );

        const newMember = {
            id: results.insertId,
            email: email,
            name: name,
        };

        return generateTokenAndRespond(res, newMember, StatusCodes.CREATED);
    } catch (err) {
        console.log(`INTERNAL_SERVER_ERROR: ${err}`);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Bad Request" });
    }
};


// ─── 토큰 생성 및 응답 처리 함수 ─────────────────────
const generateTokenAndRespond = (res, user, statusCode = StatusCodes.OK) => {
    const token = jwt.sign(
        { user_id: user.id, email: user.email },
        process.env.PRIVATE_KEY,
        { expiresIn: "30m" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 30,
    });

    return res.status(statusCode).json({
        token: token,
        name: user.name,
    });
}

module.exports = { login, register };
