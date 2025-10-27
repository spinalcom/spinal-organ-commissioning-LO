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
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const config = require("../config");
const utils_1 = require("./utils");
const constants = require("./constants");
const utils = new utils_1.Utils();
class SpinalMain {
    //private CP_to_PositionsToData = new Map<string, PositionData>();
    constructor() {
        const url = `${config.hubProtocol}://${config.userId}:${config.userPassword}@${config.hubHost}:${config.hubPort}/`;
        this.connect = spinal_core_connectorjs_type_1.spinalCore.connect(url);
    }
    /**
     *
     * Initialize connection with the hub and load graph
     * @return {*}
     * @memberof SpinalMain
     */
    init() {
        return new Promise((resolve, reject) => {
            spinal_core_connectorjs_type_1.spinalCore.load(this.connect, config.digitalTwinPath, async (graph) => {
                await spinal_env_viewer_graph_service_1.SpinalGraphService.setGraph(graph);
                console.log("Connected to the hub");
                resolve(graph);
            }, () => {
                reject();
            });
        });
    }
    /**
     * The main function of the class
     */
    async MainJob() {
        const { context, category, groupe } = constants.Objects;
        const objects = await utils.getObjects(context, category, groupe);
        //const test = objects.slice(3000,4789);
        const chunkSize = 50;
        console.log(`Starting processing ${objects.length} objects in chunks of ${chunkSize}`);
        // Process objects in chunks, removing them from the array after processing
        while (objects.length > 0) {
            const chunk = objects.splice(0, chunkSize);
            await Promise.all(chunk.map(async (item) => {
                await utils.DataHandler(item);
                //await utils.OpcuaDataHandler(item);
            }));
            console.log(`Remaining objects: ${objects.length}`);
        }
        console.log("Done main job");
    }
}
async function Main() {
    try {
        console.log('Organ Start');
        const spinalMain = new SpinalMain();
        await spinalMain.init();
        /*cron.schedule(`0 23 * * *`, async (): Promise<void> => {
           console.log("Starting main job at 23:00");
           await spinalMain.MainJob();
           console.log("Main job finished");
       });*/
        await spinalMain.MainJob();
        //process.exit(0);
    }
    catch (error) {
        console.error(error);
        setTimeout(() => {
            console.log('STOP ERROR');
            process.exit(0);
        }, 5000);
    }
}
// Call main function
Main();
//# sourceMappingURL=index.js.map