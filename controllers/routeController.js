const { StatusCodes } = require("http-status-codes");

// 모든 동선 조회 모듈
const getRoutes = async (req, res) => {
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

// 특정 장소 조회 모듈
const createRoute = async (req, res) => {
    const route = req.body;
    route.id = 1;
    route.createdAt = new Date().toISOString();
    route.updatedAt = new Date().toISOString();
    res.json(route);
};

// 특정 동선 삭제 모듈
const getRoute = async (req, res) => {
    const id = req.params.id;
    res.json({
        id: Number(id),
        name: "서울 데이트 코스",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        places: [],
        isPrivate: true,
    });
};

// 특정 동선 삭제 모듈
const deleteRoute = async (req, res) => {
    res.status(200).send();
};

// 특정 동선 업데이트 모듈
const updateRoute = async (req, res) => {
    const id = req.params.id;
    const route = req.body;
    route.id = Number(id);
    route.updatedAt = new Date().toISOString();
    res.json(route);
};

module.exports = {
    getRoutes,
    createRoute,
    getRoute,
    deleteRoute,
    updateRoute,
};
