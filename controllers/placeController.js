const { StatusCodes } = require("http-status-codes");

// 특정 장소 조회 모듈
const getPlaceById = async (req, res) => {
    const placeId = req.params.id;
  res.json({
    id: Number(placeId),
    mapx: 311277,
    mapy: 552097,
  });
};

module.exports = {
  getPlaceById
};
