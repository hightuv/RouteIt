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
          console.log("Bad Request: 잘못된 접근입니다.");
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ message: "Bad Request" });
        }

        const results = await query(
            `SELECT email, name FROM member WHERE id = ?`,
            [memberId]
        );

        if (results.length === 0) {
          console.log("NOT_FOUND: 해당 사용자를 찾을 수 없습니다.");
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
        console.log(`INTERNAL_SERVER_ERROR: ${err}`);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Bad Request" });
    }
};

// 특정 사용자 동선 조회 모듈
const getMemberRoute = async (req, res) => {
  const memberId = Number(req.params.id);

    // ERROR: memberId가 숫자가 아니면 Bad Request 응답
  if(Number.isNaN(memberId)){
    console.log("Bad Request: 잘못된 접근입니다.");
    return res.status(StatusCodes.BAD_REQUEST).json({ message: "Bad Request" });
  }

  try {
    // 1. 해당 멤버의 모든 route 조회
    const routes = await query(
      `SELECT id, name, createdAt, updatedAt, places, isPrivate FROM route WHERE member_id = ?`,
      [memberId]
    );

    // route가 없으면 빈 배열 응답
    if (routes.length === 0) {
      return res.status(StatusCodes.OK).json([]);
    }

    // 2. 모든 place ID 모으기
    const placeIds = routes.flatMap(route => JSON.parse(route.places));

    // 3. 장소 조회
    const placeholders = placeIds.map(() => '?').join(',');
    const places = await query(
      `SELECT id, mapx, mapy FROM place WHERE id IN (${placeholders})`,
      placeIds
    );

    // 4. id 기준으로 place Map 생성
    const placeMap = new Map(places.map(place => [place.id, place]));

    // 5. routes에 장소 객체 매핑
    const result = routes.map(route => {
      const placeIdsInRoute = JSON.parse(route.places);
      const placeList = placeIdsInRoute.map(id => placeMap.get(id));
      return {
        id: route.id,
        name: route.name,
        createdAt: route.createdAt,
        updatedAt: route.updatedAt,
        places: placeList,
        isPrivate: Boolean(route.isPrivate),
      };
    });

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    // ERROR: 서버 오류 발생 시 INTERNAL_SERVER_ERROR 응답
    console.log(`INTERNAL_SERVER_ERROR: ${error}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }
};

module.exports = {
    getMember,
    getMemberRoute,
};
