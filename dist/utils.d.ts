import { SpinalNodeRef } from "spinal-env-viewer-graph-service";
import { NetworkService } from "spinal-model-bmsnetwork";
import { ObjectData } from "./types";
export declare const networkService: NetworkService;
/**
 * @export
 * @class Utils
 */
export declare class Utils {
    /**
    /**
     * Function that returns bimobjects from an equipment context
     * @param  {string} contextName
     * @param  {string} categoryName
     * @param  {string} GroupName
     * @returns Promise
     */
    getObjects(ContextName: string, CategoryName: string, GroupName: string): Promise<SpinalNodeRef[]>;
    getControlPoint(ObjectId: string, controlPointNames: string[], objectData: ObjectData): Promise<ObjectData | undefined>;
    getGroupNumber(bmsendpointID: string): Promise<string>;
    FindGrpInContext(ContextName: string, nodeType: string, grpNumber: string, subnetworkID: string): Promise<any | false>;
    getSubnetwork(elementID: string): Promise<string | undefined>;
    DoubleCheckZone(Bmsgrp: any, item: SpinalNodeRef): Promise<boolean>;
    doubleCheckBalast(balastID: string, itemID: string): Promise<boolean>;
    DataHandler(item: SpinalNodeRef): Promise<void>;
    getZoneAttributeFromGrpDALI(subnetworkID: string, grpNumber: string): Promise<string | undefined>;
    getZoneFromOpcua(subnetworkID: string, zoneInfo: string): Promise<any>;
    IntegDataHandler(item: SpinalNodeRef): Promise<void>;
}
