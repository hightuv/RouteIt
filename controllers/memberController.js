// ─── 모듈 ───────────────────────────────────────
const util = require("util");
const conn = require("../mariadb");
const query = util.promisify(conn.query).bind(conn);
const { StatusCodes } = require("http-status-codes");

// ─── 특정 사용자 조회 컨트롤러 ────────────────────
const getMember = async (req, res) => {
    try {
        const memberId = parseInt(req.params.id, 10);
        if (isNaN(memberId)) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Bad Request" });
        }

        const [results] = await query(
            `SELECT email, name FROM members WHERE id = ?`,
            [memberId]
        );

        if (results.length === 0) {
            return res
                .status(StatusCodes.NOT_FOUND)
                .json({ message: "Bad Request" });
        }
        const member = results[0];
        return res.status(StatusCodes.OK).json({
            email: member.email,
            name: member.name,
        });
    } catch (err) {
        console.error(err);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Bad Request" });
    }
};

// 특정 사용자 동선 조회 모듈
const getMemberRoute = async (req, res) => {
    const memberId = req.params.id;
    res.json([
        {
            id: 1,
            name: "서울 데이트 코스",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            places: [],
            isPrivate: true,
        },
    ]);
};

module.exports = {
    getMember,
    getMemberRoute,
};
