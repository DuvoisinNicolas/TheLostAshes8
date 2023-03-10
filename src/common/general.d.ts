/**
 * This file contains some general types related to your game that can be shared between
 * front-end (Panorama) and back-end (VScripts). Only put stuff in here you need to share.
 */

interface Color {
    r: number,
    g: number,
    b: number
}

interface UnitData {
    name: string,
    level: number
}

interface IArtifact {
    id: number;
    name: string;
    modifier_name: string;
    description: string;
    image: string;
    rarity: number;
    canHaveMultiple: boolean;
}

interface IWave {
    waveId: number,
    waveLevel: number,
    ennemies: string[],
    eventsToThrow: string[],
    expReward: number,
    goldReward: number,
    relicRarity: number, // -1 for none
    itemsReward: string[]
}