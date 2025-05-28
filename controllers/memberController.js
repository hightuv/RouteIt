const { StatusCodes } = require("http-status-codes");

// 특정 사용자 조회 모듈
const getMember = async (req, res) => {
    const memberId = req.params.id;
    res.json({
        email: "mail@mail.com",
        name: "사용자",
    });
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
