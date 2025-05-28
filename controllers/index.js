const authController = require("./authController");
const memberController = require("./memberController");
const placeController = require("./placeController");
const routeController = require("./routeController");

module.exports = {
    login: authController.login,
    register: authController.register,
    getMemberRoute: memberController.getMemberRoute,
    getMember: memberController.getMember,
    getPlaceById: placeController.getPlaceById,
    getRoutes: routeController.getRoutes,
    createRoute: routeController.createRoute,
    getRoute: routeController.getRoute,
    deleteRoute: routeController.deleteRoute,
    updateRoute: routeController.updateRoute
};
