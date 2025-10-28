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

import { SpinalGraphService, SpinalNodeRef } from "spinal-env-viewer-graph-service";
import { SpinalContext, SpinalNode } from "spinal-model-graph"
import { spinalCore, Process } from "spinal-core-connectorjs_type";
import * as constants from "./constants"
import { NetworkService, InputDataEndpoint, InputDataEndpointDataType, InputDataEndpointType } from "spinal-model-bmsnetwork"
import { SpinalAttribute } from "spinal-models-documentation/declarations";
import { attributeService, ICategory } from "spinal-env-viewer-plugin-documentation-service";
import { ObjectData} from "./types";


import { get } from "http";
import { group } from "console";
import { start } from "repl";
export const networkService = new NetworkService()



/**
 * @export
 * @class Utils
 */
export class Utils {  
    /**
    /**
     * Function that returns bimobjects from an equipment context 
     * @param  {string} contextName
     * @param  {string} categoryName
     * @param  {string} GroupName
     * @returns Promise
     */
    public async getObjects(ContextName: string, CategoryName: string, GroupName: string): Promise<SpinalNodeRef[]> {
        try {
            const Context = SpinalGraphService.getContext(ContextName);
            if (!Context) {
                console.log("Context not found");
                return [];
            }

            const ContextID = Context.info.id.get();
            const category = (await SpinalGraphService.getChildren(ContextID, ["hasCategory"])).find(child => child.name.get() === CategoryName);
            if (!category) {
                console.log("Category ", CategoryName, " not found");
                return [];
            }

            const categoryID = category.id.get();
            const Groups = await SpinalGraphService.getChildren(categoryID, ["hasGroup"]);
            if (Groups.length === 0) {
                console.log("No groups found under the category");
                return [];
            }

            const ObjectGroup = Groups.find(bmsgroup => bmsgroup.name.get() === GroupName);
            if (!ObjectGroup) {
                console.log("Group ", GroupName, " not found");
                return [];
            }

            

            const Objects = await SpinalGraphService.getChildren(ObjectGroup.id.get(), ["groupHasBIMObject"]);
            if (Objects.length === 0) {
                console.log("No objects found in the bmsgroup");
                return [];
            }

            //console.log("Objects found:", Objects);
            return Objects;

        } catch (error) {
            console.error("Error in getObjects:", error);
            return [];
        }
    }


public async getControlPoint(ObjectId: string,controlPointNames: string[], objectData: ObjectData): Promise<ObjectData | undefined> {
  
  try {
  const NODE_TO_CONTROL_POINTS_RELATION = "hasControlPoints";
  const CONTROL_POINTS_TO_BMS_ENDPOINT_RELATION = "hasBmsEndpoint";
  const allControlPoints = await SpinalGraphService.getChildren(ObjectId, [NODE_TO_CONTROL_POINTS_RELATION]);
  

  for (const controlPoint of allControlPoints) {
    if(controlPoint.name.get()!==constants.controlPointProfil) return undefined;
    const allBmsEndpoints = await SpinalGraphService.getChildren( controlPoint.id.get(),[CONTROL_POINTS_TO_BMS_ENDPOINT_RELATION]);
    for (const bmsEndPoint of allBmsEndpoints) {
      const endpointName = bmsEndPoint.name.get();

      if (controlPointNames.includes(endpointName)) {
        switch (endpointName) {
          case constants.BalastControlPoint:
            objectData.BalastCP = bmsEndPoint;
            break;
          case constants.GroupControlPoint:
            objectData.GroupCP = bmsEndPoint;
            break;
          case constants.ZoneControlPoint:
            objectData.ZoneCP = bmsEndPoint;
            break;
          case constants.IntegrationControlPoint:
            objectData.IntegrationCP = bmsEndPoint;
            break;
          case constants.DuplicatedZoneControlPoint:
                objectData.DuplicatedZoneCP = bmsEndPoint;
                break;
          case constants.OPCUAControlPoint:
            objectData.OPCUACP = bmsEndPoint;
            break;
          case constants.CorrectBalastControlPoint:
                objectData.CorrectBalastCP = bmsEndPoint;
                break; 
        }
      }
    }
  }

  return objectData;} catch (error) {
    const realobject = SpinalGraphService.getRealNode(ObjectId);
    console.log(realobject._server_id, "getControlPoint ERROR for object", realobject.info.name.get());
    return undefined;
  }
}

public async getGroupNumber(bmsendpointID: string): Promise<string> {
  try {
    const children = await SpinalGraphService.getChildren(bmsendpointID, ["hasBmsEndpoint"]);
    const groupChild = children.find(child => child.name && child.name.get() === "Groups");

    if (groupChild) {
      const groupElement = await groupChild.element.load();
      if (groupElement && groupElement.currentValue) {
        return groupElement.currentValue.get().toString();
      }
    }

    return 'null';
  } catch (error) {
    console.error("Error in getGroupNumber:", error);
    return 'null';
  }
}

/*public async FindGrpInContext(ContextName: string, nodeType: string, grpNumber: string,subnetworkID :string): Promise<any|false> {
    try{
    
        
    const zoneContext = SpinalGraphService.getContext(ContextName);
    //console.log("Grp DALI" + " " + grpNumber);
    const netGroups = (await SpinalGraphService.findInContextByType(zoneContext.info.id.get(), zoneContext.info.id.get(), nodeType)).filter(e => e.name.get() == "Grp DALI" + " " + grpNumber);
    const bmsGroupsArray = await Promise.all(netGroups.map(async g => await SpinalGraphService.getChildren(g.id.get(), ["hasBmsEndpoint"])));
    const bmsGroups = bmsGroupsArray.flat();
    for (const group of bmsGroups) {
        //console.log(group.id.get() + " " + group.name.get());
        const subnet = await this.getSubnetwork(group.id.get());
        if (subnet === subnetworkID) {
            return group;
        }
    }
    return false;
    } catch (error) {
        console.error("Error in getZoneForGrp:", error);
        return false;
    }
  
}*/
public async FindGrpInContext(
  ContextName: string,
  nodeType: string,
  grpNumber: string,
  subnetworkID: string
): Promise<any | false> {
  try {
    const zoneContext = SpinalGraphService.getContext(ContextName);

    const netGroups = (
      await SpinalGraphService.findInContextByType(
        zoneContext.info.id.get(),
        zoneContext.info.id.get(),
        nodeType
      )
    ).filter(e => e.name.get() === `Grp DALI ${grpNumber}`);

    const bmsGroupsArray = await Promise.all(
      netGroups.map(g =>
        SpinalGraphService.getChildren(g.id.get(), ["hasBmsEndpoint"])
      )
    );
    const bmsGroups = bmsGroupsArray.flat();

    // Vérifications en parallèle
    const matches = await Promise.all(
      bmsGroups.map(async group => {
        const subnet = await this.getSubnetwork(group.id.get());
        return subnet === subnetworkID ? group : null;
      })
    );

    return matches.find(g => g !== null) || false;
  } catch (error) {
    console.error("Error in FindGrpInContext:", error);
    return false;
  }
}


public async getSubnetwork(elementID:string): Promise<string | undefined> {
    try{
    //const realelement = SpinalGraphService.getRealNode(elementID); 
    //const parents= await realelement.getParents(["hasBmsEndpoint"]);   
    const parents = await SpinalGraphService.getParents(elementID,"hasBmsEndpoint");
    const parent = parents.find(p => p.type.get() === "BmsEndpoint");
    if(!parent) return undefined;
    return parent.id.get();
    }catch(error){
        console.error("Error in getSubnetwork:", error);
        return undefined;
    }
}
    public async DoubleCheckZone(Bmsgrp: any, item: SpinalNodeRef): Promise<boolean> {
        try {
            const netGroups = (await SpinalGraphService.getParents(Bmsgrp.id.get(), ["hasBmsEndpoint"])).filter(e => e.type.get() == "network");
            const zones = await Promise.all(
                netGroups.map(async g => {
                    const parentGroups = await SpinalGraphService.getParents(g.id.get(), ["hasNetworkTreeGroup"]);
                    return parentGroups.filter(x => x.subtype?.get() === "zone");
                })
            );
            const zoneList = zones.flat();
            if (zoneList.length > 1) {
                console.log("Multiple zones found for :", item.name.get());
                return false;
            } else {
                return true;
            }
        } catch (error) {
            console.error("Error in DoubleCheckZone:", error);
            return false;
        }

    }

    public async doubleCheckBalast(balastID: string, itemID: string): Promise<boolean> {
        try {
            const balastNode = SpinalGraphService.getRealNode(balastID);
                const opcuaAttribute = await attributeService.findOneAttributeInCategory(balastNode, "OPC Attributes", "Name");
                if (opcuaAttribute !== -1) {
                    const opcuaName = opcuaAttribute.value.get();
                    const itemNode = SpinalGraphService.getRealNode(itemID);
                        const itemOpcuaAttribute = await attributeService.findOneAttributeInCategory(itemNode, "OPC Attributes", "LO_Nom_Référence");
                        if (itemOpcuaAttribute !== -1) {
                            const itemOpcuaName = itemOpcuaAttribute.value.get();
                            if (opcuaName === itemOpcuaName) {
                                return true;
                            } else {
                                console.log("Balast OPCUA Name does not match with LO Nom Référence:", opcuaName, "!==", itemOpcuaName);
                                return false;
                            }
                        }
                }
            
            return false;

        } catch (error) {
            console.error("Error in doubleCheckBalast:", error);
            return false;
        }

    }


   
    public async DataHandler(item: SpinalNodeRef) {

        let objectData: ObjectData = {
            BalastCP: undefined,
            GroupCP: undefined,
            ZoneCP: undefined,
            DuplicatedZoneCP: undefined,
            IntegrationCP: undefined,
            OPCUACP: undefined,
            CorrectBalastCP: undefined

        };

        //console.log("in datahandler")
        let getControlEndPoints = await this.getControlPoint(item.id.get(), constants.controlPointNames, objectData);

        if (getControlEndPoints.IntegrationCP && getControlEndPoints.CorrectBalastCP 
            && getControlEndPoints.BalastCP && getControlEndPoints.GroupCP && 
            getControlEndPoints.ZoneCP && getControlEndPoints.DuplicatedZoneCP && 
            getControlEndPoints.OPCUACP) {


            //Initialize  control point to false
            await networkService.setEndpointValue(getControlEndPoints.IntegrationCP!.id.get(), false);
            await networkService.setEndpointValue(getControlEndPoints.CorrectBalastCP!.id.get(), false);
            await networkService.setEndpointValue(getControlEndPoints.BalastCP.id.get(), false);
            await networkService.setEndpointValue(getControlEndPoints.GroupCP.id.get(), false);
            await networkService.setEndpointValue(getControlEndPoints.ZoneCP.id.get(), false);
            await networkService.setEndpointValue(getControlEndPoints.DuplicatedZoneCP.id.get(), false);
            await networkService.setEndpointValue(getControlEndPoints.OPCUACP.id.get(), false);
            //Start the Processing
            const bmsEndPoints = await SpinalGraphService.getChildren(item.id.get(), ["hasBmsEndpoint"]);
            //console.log(bmsEndPoints);
            if (bmsEndPoints.length != 0) {
                const balast = bmsEndPoints[0]
                const groupNumber = await this.getGroupNumber(balast.id.get());
                //integration data processing
                const doubleCheckBalast = await this.doubleCheckBalast(balast.id.get(), item.id.get());
                if (doubleCheckBalast != false) {
                    await networkService.setEndpointValue(getControlEndPoints.CorrectBalastCP!.id.get(), true);
                    
                    if (groupNumber != 'null' && groupNumber != "") {

                        const subnetworkID = await this.getSubnetwork(balast.id.get());
                        if (subnetworkID != undefined) {
                            //console.log("Subnetwork ID found:", subnetworkID);
                            const grpInPositionContext = await this.FindGrpInContext(constants.PositionContext.context, "network", groupNumber, subnetworkID!);
                            if (grpInPositionContext != false) {
                                const grpDaliInZone = await this.FindGrpInContext(constants.ZoneContext.context, "network", groupNumber, subnetworkID!);
                                if (grpDaliInZone != false) {
                                    //console.log("Zone found for group", groupNumber, ":", grpDaliInZone.id.get());
                                    const doubleCheck = await this.DoubleCheckZone(grpDaliInZone,item);
                                    //console.log("Double check for multiple zones for group", groupNumber, ":", doubleCheck);
                                    if (doubleCheck) {
                                        await networkService.setEndpointValue(getControlEndPoints.IntegrationCP.id.get(), true)
                                    }

                                }
                            }
                        }
                    }
                }

                //OPCUA data processing
                await networkService.setEndpointValue(getControlEndPoints.BalastCP.id.get(), true);
                if (groupNumber != 'null' && groupNumber != "") {
                    await networkService.setEndpointValue(getControlEndPoints.GroupCP.id.get(), true)
                    const subnetworkID = await this.getSubnetwork(balast.id.get());
                    if (subnetworkID != undefined) {
                        //console.log("Subnetwork ID found:", subnetworkID);
                        const zoneInfo = await this.getZoneAttributeFromGrpDALI(subnetworkID, groupNumber);
                        if (zoneInfo) {
                            //console.log("Zone Info found:", zoneInfo);
                            const zoneVerification = await this.getZoneFromOpcua(subnetworkID, zoneInfo);
                            //console.log("zone exists : ",zoneVerification.zoneexists,"Double zone :", zoneVerification.zonedublicated);
                            if (zoneVerification.zoneexists == true) {
                                await networkService.setEndpointValue(getControlEndPoints.ZoneCP.id.get(), true)
                                if (zoneVerification.zonedublicated == true) {
                                    await networkService.setEndpointValue(getControlEndPoints.DuplicatedZoneCP.id.get(), true)
                                    console.log("Skipping DuplicatedZoneCP set to false due to multiple zones for group", groupNumber, "object:", item.name.get());
                                } else {
                                    await networkService.setEndpointValue(getControlEndPoints.DuplicatedZoneCP.id.get(), false)
                                    await networkService.setEndpointValue(getControlEndPoints.OPCUACP.id.get(), true)
                                }
                            }
                        }
                    }


                }

                ///bmsEndPoints.length = 0;
                
            }
            
            
        }
       
        //objectData = null;
        //getControlEndPoints = null;

    }
 


public async getZoneAttributeFromGrpDALI(subnetworkID: string, grpNumber :string ): Promise< string | undefined> {
    const bmsgrp = (await SpinalGraphService.getChildren(subnetworkID, ["hasBmsEndpoint"])).find(e => e.name.get() == "Grp DALI" + " " + grpNumber);
    if(bmsgrp) {
        const realgrp = SpinalGraphService.getRealNode(bmsgrp.id.get());
        const zoneAttribute = await attributeService.findOneAttributeInCategory(realgrp, "OPC Attributes", "Info");
        if (zoneAttribute != -1) {
            return zoneAttribute.value.get();
        }
    }
    return undefined;
}


    public async getZoneFromOpcua(subnetworkID: string, zoneInfo: string): Promise<any> {
        const zoneVerification = {
            zoneexists: false,
            zonedublicated: false
        };

        const gateway = (await SpinalGraphService.getParents(subnetworkID, ["hasBmsEndpoint"]))
            .find(e => e.type.get() === "BmsDevice");

        if (!gateway) return zoneVerification;

        const zoneNode = (await SpinalGraphService.getChildren(gateway.id.get(), ["hasBmsEndpoint"]))
            .find(e => e.name.get().toLowerCase() === "zones");

        if (!zoneNode) return zoneVerification;

        const allZones = await SpinalGraphService.getChildren(zoneNode.id.get(), ["hasBmsEndpoint"]);
        if (allZones.length === 0) return zoneVerification;
        // Filtrer les zones en fonction de l'attribut "Zone info 2"
        const filteredZones = (
            await Promise.all(allZones.map(async z => {
                const realz = SpinalGraphService.getRealNode(z.id.get());
                const attr = await attributeService.findOneAttributeInCategory(realz, "OPC Attributes", "Zone info 2");

                if (attr !== -1) {
                    const zoneValue = attr.value.get().slice(0, 8).toLowerCase();
                    if (zoneValue === zoneInfo.slice(0, 8).toLowerCase()) {
                        return z; // zone correspondante
                    }
                }
                return null; // pas de correspondance
            }))
        ).filter(Boolean); // filtre tous les null

        // Vérification du résultat
        if (filteredZones.length > 0) {
            zoneVerification.zoneexists = true;
            if (filteredZones.length > 1) {
                zoneVerification.zonedublicated = true;
            }
        }

        return zoneVerification;
    }
    public async IntegDataHandler(item: SpinalNodeRef) {

        const objectData: ObjectData = {
            BalastCP: undefined,
            GroupCP: undefined,
            ZoneCP: undefined,
            DuplicatedZoneCP: undefined,
            IntegrationCP: undefined,
            OPCUACP: undefined,
            CorrectBalastCP: undefined

        };

        const getControlEndPoints = await this.getControlPoint(item.id.get(), constants.controlPointNames, objectData);

        if (getControlEndPoints.IntegrationCP && getControlEndPoints.CorrectBalastCP) {


            //Initialize  control point to false
            await networkService.setEndpointValue(getControlEndPoints.IntegrationCP!.id.get(), false);
            await networkService.setEndpointValue(getControlEndPoints.CorrectBalastCP!.id.get(), false);
            const bmsEndPoints = await SpinalGraphService.getChildren(item.id.get(), ["hasBmsEndpoint"]);
            //console.log(bmsEndPoints);
            if (bmsEndPoints.length != 0) {
                const balast = bmsEndPoints[0]
                const doubleCheckBalast = await this.doubleCheckBalast(balast.id.get(), item.id.get());
                if (doubleCheckBalast != false) {
                    await networkService.setEndpointValue(getControlEndPoints.CorrectBalastCP!.id.get(), true);
                    const groupNumber = await this.getGroupNumber(balast.id.get());
                    if (groupNumber != 'null' && groupNumber != "") {

                        const subnetworkID = await this.getSubnetwork(balast.id.get());
                        if (subnetworkID != undefined) {
                            //console.log("Subnetwork ID found:", subnetworkID);
                            const grpInPositionContext = await this.FindGrpInContext(constants.PositionContext.context, "network", groupNumber, subnetworkID!);
                            if (grpInPositionContext != false) {
                                const grpDaliInZone = await this.FindGrpInContext(constants.ZoneContext.context, "network", groupNumber, subnetworkID!);
                                if (grpDaliInZone != false) {
                                    //console.log("Zone found for group", groupNumber, ":", grpDaliInZone.id.get());
                                    const doubleCheck = await this.DoubleCheckZone(grpDaliInZone,item);
                                    //console.log("Double check for multiple zones for group", groupNumber, ":", doubleCheck);
                                    if (doubleCheck) {
                                        await networkService.setEndpointValue(getControlEndPoints.IntegrationCP.id.get(), true)
                                    }


                                }
                            }


                        }
                    }
                }
                
            }
        }

    }


    /*public async OpcuaDataHandler(item: SpinalNodeRef) {

        const objectData: ObjectData = {
            BalastCP: undefined,
            GroupCP: undefined,
            ZoneCP: undefined,
            DuplicatedZoneCP: undefined,
            IntegrationCP: undefined,
            OPCUACP: undefined,
            CorrectBalastCP: undefined
        };

        //console.log("in datahandler")
        const getControlEndPoints = await this.getControlPoint(item.id.get(), constants.controlPointNames, objectData);

        if (getControlEndPoints.OPCUACP && getControlEndPoints.BalastCP && getControlEndPoints.GroupCP && getControlEndPoints.ZoneCP && getControlEndPoints.DuplicatedZoneCP) {
            //Initialize all control points to false
            await networkService.setEndpointValue(getControlEndPoints.OPCUACP.id.get(), false)
            await networkService.setEndpointValue(getControlEndPoints.BalastCP.id.get(), false)
            await networkService.setEndpointValue(getControlEndPoints.GroupCP.id.get(), false)
            await networkService.setEndpointValue(getControlEndPoints.ZoneCP.id.get(), false)
            await networkService.setEndpointValue(getControlEndPoints.DuplicatedZoneCP.id.get(), false)
            //Start the Processing

            console.log("Processing item:", item.name.get());
            const bmsEndPoints = await SpinalGraphService.getChildren(item.id.get(), ["hasBmsEndpoint"]);
            //console.log(bmsEndPoints);
            if (bmsEndPoints.length != 0) {
                await networkService.setEndpointValue(getControlEndPoints.BalastCP.id.get(), true);
                const balast = bmsEndPoints[0]
                //const groupNumber = await this.getGroupNumber(balast.id.get());
                if (groupNumber != 'null') {
                    await networkService.setEndpointValue(getControlEndPoints.GroupCP.id.get(), true)
                    const subnetworkID = await this.getSubnetwork(balast.id.get());
                    if (subnetworkID != undefined) {
                        console.log("Subnetwork ID found:", subnetworkID);
                        const zoneInfo = await this.getZoneAttributeFromGrpDALI(subnetworkID, groupNumber);
                        if (zoneInfo) {
                            console.log("Zone Info found:", zoneInfo);
                            const zoneVerification = await this.getZoneFromOpcua(subnetworkID, zoneInfo);
                            console.log("zone exists : ",zoneVerification.zoneexists,"Double zone :", zoneVerification.zonedublicated);
                            if (zoneVerification.zoneexists == true) {
                                await networkService.setEndpointValue(getControlEndPoints.ZoneCP.id.get(), true)
                                if (zoneVerification.zonedublicated == true) {
                                    await networkService.setEndpointValue(getControlEndPoints.DuplicatedZoneCP.id.get(), true)
                                    console.log("Skipping DuplicatedZoneCP set to true due to multiple zones for group", groupNumber, "object:", item.name.get());
                                } else {
                                    await networkService.setEndpointValue(getControlEndPoints.DuplicatedZoneCP.id.get(), false)
                                    await networkService.setEndpointValue(getControlEndPoints.OPCUACP.id.get(), true)
                                }
                            }
                        }
                    }


                }
                bmsEndPoints.length = 0;

            }
        }
    }*/
}