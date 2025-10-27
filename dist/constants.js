"use strict";
/*
 * Copyright 2025 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrectBalastControlPoint = exports.OPCUAControlPoint = exports.IntegrationControlPoint = exports.DuplicatedZoneControlPoint = exports.ZoneControlPoint = exports.GroupControlPoint = exports.BalastControlPoint = exports.controlPointNames = exports.controlPointProfil = exports.PositionContext = exports.ZoneContext = exports.Objects = void 0;
exports.Objects = Object.freeze({
    context: "Gestion des équipements",
    category: "Commissioning télécommande",
    groupe: "Luminaire - Open space"
});
exports.ZoneContext = Object.freeze({
    context: "Hardware Context Zones"
});
exports.PositionContext = Object.freeze({
    context: "Hardware Context Position Groupe"
});
exports.controlPointProfil = "Commissioning";
exports.controlPointNames = [
    "Has Balast",
    "Has Group",
    "Has Zone",
    "Has Duplicated Zone",
    "Monitored/Integration",
    "Monitored/OPCUA",
    "Correct Balast"
];
exports.BalastControlPoint = "Has Balast";
exports.GroupControlPoint = "Has Group";
exports.ZoneControlPoint = "Has Zone";
exports.DuplicatedZoneControlPoint = "Has Duplicated Zone";
exports.IntegrationControlPoint = "Monitored/Integration";
exports.OPCUAControlPoint = "Monitored/OPCUA";
exports.CorrectBalastControlPoint = "Correct Balast";
//# sourceMappingURL=constants.js.map