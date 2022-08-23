/*
 * Copyright 2022 SpinalCom - www.spinalcom.com
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

import {SpinalGraphService, SpinalNodeRef} from "spinal-env-viewer-graph-service";
import {SpinalNode} from "spinal-model-graph"
import {spinalCore,Process} from "spinal-core-connectorjs_type";
import * as constants from "./constants"
import { NetworkService, InputDataEndpoint, InputDataEndpointDataType, InputDataEndpointType }  from "spinal-model-bmsnetwork"
import pilotage_utilities from "./pilotage_utilities";

export const networkService = new NetworkService()



/**
 * @export
 * @class Utils
 */
 export class Utils{


  
    /**
     * @param  {string} contextName
     * @param  {string} categoryName
     * @returns Promise
     */
    public async getMonitorableRoom(contextName: string, categoryName: string): Promise<Array<SpinalNodeRef>> {
        let context = undefined;
        let category = undefined;
        //get context
        let roomContext = await SpinalGraphService.getContextWithType("geographicRoomGroupContext");
        roomContext.forEach(elt => {
            if(elt.info.name.get()==contextName) context = elt;
        });
        //get category
        let children = await SpinalGraphService.getChildren(context.info.id.get(),["hasCategory"]);
        children.forEach(elt => {
            if(elt.name.get()==categoryName) category = elt;
        });
        //get rooms
        let rooms = await SpinalGraphService.findInContext(category.id.get(), context.info.id.get(), (elt:SpinalNode<any>) => {
            if(elt.info.type.get() == "geographicRoom"){
                (<any>SpinalGraphService)._addNode(elt);
                return true;
            }
            return false;
        });

        console.log("Monitorable rooms : ", rooms);
        return rooms;
    }


    /**
     * @param  {string} roomId
     * @returns Promise
     */
    public async getCommandControlPoint(roomId: string): Promise<Array<SpinalNodeRef>>{
        const NODE_TO_CONTROL_POINTS_RELATION = "hasControlPoints";
        const CONTROL_POINTS_TO_BMS_ENDPOINT_RELATION = "hasBmsEndpoint";
        let commandControlPoint = [];

        let allControlPoints = await SpinalGraphService.getChildren(roomId, [NODE_TO_CONTROL_POINTS_RELATION]);
        if(allControlPoints.length!=0){
            for (let controlPoint of allControlPoints) {
                // console.log(controlPoint);
                let allBmsEndpoints = await SpinalGraphService.getChildren(controlPoint.id.get(), [CONTROL_POINTS_TO_BMS_ENDPOINT_RELATION]);
                if(allBmsEndpoints.length!=0){
                    for (let bmsEndPoint of allBmsEndpoints) {
                        let nodeElement = await bmsEndPoint.element.load();
                        if(nodeElement.get().command == 1) commandControlPoint.push(bmsEndPoint);
                    }
                }
                
            }
        }

        console.log("Room command controlPoints : ",commandControlPoint);
        
        return commandControlPoint;
    }



    /**
     * @param  {Array<SpinalNodeRef>} endPointList
     * @returns Promise
     */
    public async getBmsEndpointGroup(endPointList: Array<SpinalNodeRef>): Promise<Object>{
        //build the object = {Command_Light: [], Command_Blind: [], Command_Temperature: []}
        let endpointGroupCommand = this.getObjectFormat()
        
        if(endPointList.length!=0){
            //get bmsEndpointGroup for every endpoint
            for(let endpoint of endPointList){
                let group = await SpinalGraphService.getParents(endpoint.id.get(),"groupHasBmsEndpoint");
                if(group.length!=0){
                    for(let elt of group){
                        //add into the object, every endpoint that is linked to it's corresponding bmsEndpointGroup command
                        endpointGroupCommand = this.orderEndpointGroupCommand(elt,endpoint,endpointGroupCommand);
                    }
                }              
            }
        }
        console.log(endpointGroupCommand)
        return endpointGroupCommand;
    }

    
  
    /**
     * @param  {SpinalNodeRef} group
     * @param  {SpinalNodeRef} endpoint
     * @param  {Object} object
     * @returns Object
     */
    public orderEndpointGroupCommand(group: SpinalNodeRef, endpoint: SpinalNodeRef, object: Object): Object{
        for(let endpointGroup in object){
            if(endpointGroup==group.name.get()) object[endpointGroup].push(endpoint)
        }
        return object;

    }

    /**
     * @returns Object
     */
    public getObjectFormat(): Object{
        let endpointGroupCommand = {};
        const ENDPOINT_GROUP_COMMANDE = constants.ENDPOINT_GROUP_COMMANDE;

        for(let x of ENDPOINT_GROUP_COMMANDE){
            endpointGroupCommand[x] = [];
        }
        return endpointGroupCommand;
    }


    /**
     * @param  {string} roomId
     * @returns Promise
     */
    public async getRoomBmsEndpointPoint(roomId: string): Promise<Array<SpinalNodeRef>>{
        let roomBmsEndPoint= [];
        
        let bimObjects = await SpinalGraphService.getChildren(roomId, ["hasBimObject"]);
        console.log("BIM OBJECT : ",bimObjects)

        for (let obj of bimObjects){
            let bmsEndPoint = await SpinalGraphService.getChildren(obj.id.get(), ["hasBmsEndpoint"]);          
            roomBmsEndPoint = roomBmsEndPoint.concat(bmsEndPoint);
        }

        console.log("ENDPOINT LIST : ",roomBmsEndPoint);
        return roomBmsEndPoint;
    }




    /**
     * @param  {Array<SpinalNodeRef>} controlPointList
     * @param  {Object} endpointObject
     * @returns Promise
     */
    public async bindControlpointToEndpoint(controlPointList: Array<SpinalNodeRef>, endpointObject: Object): Promise<void>{
        if(controlPointList.length!=0){
            //Parcourir la liste des controlPoint de commande d'une pièce
            for(let cp of controlPointList){
                //Parcourir les endpointGroupe de commandes dans l'objet et avoir la liste des endpoints dans chaque groupe
                for(let ep in endpointObject){
                    //si le nom du groupe correspond au nom du controlPointCommand alors lié le controlPoint à la liste des endpoints
                    if(cp.name.get().toLowerCase()==ep.toLowerCase()){
                        let controlPointValueModel = (await cp.element.load()).currentValue;
                        
                        //bind le controlPoint aux endpoint
                        controlPointValueModel.bind(async () =>{
                            console.log("Endpoints BINDED");        
                        
                            //Avoir la liste des endPoints
                            let endpoints = endpointObject[ep];
                            if(endpoints.length!=0){
                                let promises = endpoints.map(x => {
                                    return this.updateControlEndpointWithAnalytic(x, controlPointValueModel.get(),
                                     InputDataEndpointDataType.Real, InputDataEndpointType.Other);
                                })

                                await Promise.all(promises)
                                // for(let x of endpoints){

                                //     //copier le currentValue du controlPointCommand dans la currentValue de chaque endPoint associé
                                //     // (await x.element.load()).currentValue.set(controlPointValueModel.get())
                                //     await this.updateControlEndpointWithAnalytic(x, controlPointValueModel.get(),
                                //      InputDataEndpointDataType.Real, InputDataEndpointType.Other);

                                // }
                            }
                        });

                    }   
                }
            }
        }
    }


    
    /**
     * @param  {SpinalNodeRef} model
     * @param  {any} valueToPush
     * @param  {any} dataType
     * @param  {any} type
     * @returns Promise
     */
    public async updateControlEndpointWithAnalytic(model:SpinalNodeRef, valueToPush:any, dataType:any, type:any): Promise<void>{
        if(valueToPush != undefined) {
            const input : InputDataEndpoint = {
                id: "",
                name: "",
                path: "",
                currentValue: valueToPush,
                unit: "",
                dataType: dataType,
                type: type,
                nodeTypeName: "BmsEndpoint"// should be SpinalBmsEndpoint.nodeTypeName || 'BmsEndpoint'
            };
            const time = new Date();   //Register in TimeSeries
            const nodeId = model.id.get();
            const realNode = SpinalGraphService.getRealNode(nodeId);
            // await Promise.all([pilotage_utilities.sendUpdateRequest(nodeId, realNode,valueToPush), networkService.updateEndpoint(model,input,time)])
            await networkService.updateEndpoint(model,input,time);

            console.log(model.name.get() + " ==>  is updated ");
        }
        else{
            console.log(valueToPush + " value to push in node : " + model.name.get() + " -- ABORTED !");
        }
    }

 }