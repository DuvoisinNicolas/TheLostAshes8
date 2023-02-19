import { reloadable } from "./lib/tstl-utils";
import { modifier_panic } from "./modifiers/modifier_panic";

const heroSelectionTime = 20;
const timeBetweenWaves = 5;

declare global {
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}



class Wave implements IWave{
    // Counter to increment on each Wave to get an ID
    static currentId: number;
    
    waveId: number;
    waveLevel: number;
    ennemies: string[];
    eventsToThrow: string[];
    expReward: number;
    goldReward: number;
    relicRarity: number; // -1 for none
    itemsReward: string[];

    constructor(waveLevel: number, ennemies: string[], eventsToThrow: string[], 
        expReward: number, goldReward: number, relicRarity: number, itemsReward: string[]){
            // if first time using ID, create counter
            if (typeof Wave.currentId === 'undefined' ){
                Wave.currentId = 1;
            }

            // determining an ID
            this.waveId = Wave.currentId;
            Wave.currentId += 1;

            this.waveLevel = waveLevel;
            this.ennemies = ennemies;
            this.eventsToThrow = eventsToThrow;
            this.expReward = expReward;
            this.goldReward = goldReward;
            this.relicRarity = relicRarity;
            this.itemsReward = itemsReward;
    }

}

class Artifact implements IArtifact {
    static idCounter: number;
    id: number;
    name: string;
    modifier_name: string;
    description: string;
    image: string;
    rarity: number;
    canHaveMultiple: boolean;

    constructor (name:string, modifier_name:string, description:string, image:string, rarity: number, canHaveMultiple: boolean, id:number|undefined){
        // if first time using ID, create counter
        if (typeof Artifact.idCounter === 'undefined'){
            Artifact.idCounter = 1;
        }

        if (typeof id == "undefined"){
            // determining an ID
            this.id = Artifact.idCounter;
            Artifact.idCounter += 1;
        }
        else{
            this.id = id;
        }


        this.name = name;
        this.modifier_name = modifier_name;
        this.description = description;
        this.image = image;
        this.rarity = rarity;
        this.canHaveMultiple = canHaveMultiple;
    }
}

const artifacts = [
    new Artifact("TestName1", "modifier_my_banana", "Ceci est une description très longue qui explique que en gros tu va gagner un effet qui va tranformer tout les arbres autour de toi en chaussure. Ne fonctionne pas sur treant, ni sur les arbres qui sont nés entre 1999 et 2014.", "tstl.png", 1, true, undefined),
    new Artifact("TestName2", "modifier_my_banana", "test_desc2", "tstl.png", 1, true, undefined ),
    new Artifact("TestName3", "modifier_my_banana", "test_desc3", "tstl.png", 1, true, undefined),
    new Artifact("TestName4", "modifier_my_banana", "test_desc4", "tstl.png", 2, true, undefined),
    new Artifact("TestName5", "modifier_my_banana", "test_desc5", "tstl.png", 2, true, undefined),
    new Artifact("TestName6", "modifier_my_banana", "test_desc6", "tstl.png", 3, true, undefined),
    new Artifact("TestName7", "modifier_my_banana", "test_desc7", "tstl.png", 4, true, undefined),
]



// Rarity from 1 to 5, 0 is no relic
const waves = [
    new Wave(
        0,
        ["npc_my_dota_wraith_king_skeleton_warrior", "npc_my_dota_wraith_king_skeleton_warrior"],
        [],
        500,
        1000,
        2,
        ["item_greater_crit"]
    ),
    new Wave(
        0,
        ["npc_my_dota_wraith_king_skeleton_warrior"],
        [],
        600,
        1200,
        2,
        ["item_refresher"]
    ),
    new Wave(
        1,
        ["npc_my_dota_wraith_king_skeleton_warrior", "npc_my_dota_wraith_king_skeleton_warrior", "npc_my_dota_wraith_king_skeleton_warrior"],
        ["custom_event"], // TODO remove
        600,
        1200,
        2,
        ["item_greater_crit"]
    )
]

function getWaveById(id: number): Wave | undefined{
    for (let i=0; i<waves.length; ++i){
        if (waves[i].waveId == id){
            return waves[i];
        }
    }
}

const maxWaveNumber = waves.length

function launchArtifactPicker(unit: CDOTA_BaseNPC_Hero, artifacts: IArtifact[]) : Artifact | undefined{
    // TODO: Throw choose artifact event
    if (artifacts.length != 3){
        print("Uh oh, something went wrong");
        return;
    }
    CustomGameEventManager.Send_ServerToPlayer(
        unit.GetPlayerOwner(), 
        "heroArtifactPickingEvent", 
        {
            hero: unit.GetPlayerID(),
            artifact1: artifacts[0],
            artifact2: artifacts[1],
            artifact3: artifacts[2],
        }
    )
    
}

function pickRandomArtifacts(minRarity: number): Artifact[]{
    class ArtifactWithOdds{
        artifact: Artifact;
        oddsToSuccess: number;
        constructor (artifact: Artifact, oddsToSuccess: number){
            this.artifact = artifact;
            this.oddsToSuccess = oddsToSuccess;
        }
    }

    let possibleArtifacts : ArtifactWithOdds[] = []
    let artifactsFinalChoices : Artifact[] = [];
    // TODO: Check if player doesn't have it already and canHaveMultiple is false
    for (let artifact of artifacts){
        // If rarity is lower than the asked one, just skip
        if (artifact.rarity < minRarity){
            continue
        }
        // If rarity is equal, add and set odds to success to 100%
        if (artifact.rarity == minRarity){
            possibleArtifacts.push(new ArtifactWithOdds(artifact, 1.00))
        }
        // If rarity is superior, add but set odds to lower value (to allow fail and retry)
        if (artifact.rarity > minRarity){
            // 1 / artifact rarity - min rarity + 1 ==> 1/5-4+1 = 1/2 ==> 1 out of 2 to success
            possibleArtifacts.push(new ArtifactWithOdds(artifact, (1.00/(artifact.rarity - minRarity + 1))))
        }
    }

    if (possibleArtifacts.length < 3){
        print("Error");
        // Panic exit, shouldn't happen
        return artifactsFinalChoices;
    }

    while (artifactsFinalChoices.length < 3){
        let success = false;
        while (!success){
            const randomRelic = possibleArtifacts[Math.floor(Math.random() * possibleArtifacts.length)];
            let randomValue = Math.floor(Math.random())
            // If random value (between 0-1) is lower than odds to success, return relic
            if ((randomRelic.oddsToSuccess >= randomValue) && !artifactsFinalChoices.includes(randomRelic.artifact)){
                success = true
                artifactsFinalChoices.push(randomRelic.artifact)
            }
            // else, continue loop until we succeed
        }
    }
    return artifactsFinalChoices;
}

function addArtifactToPlayer (artifact: IArtifact, playerID: PlayerID){
    let player :CDOTAPlayerController = getPlayerFromID(playerID)!;
    let hero = player.GetAssignedHero();
    print("adding", artifact.modifier_name, "to", hero.GetName());
    // Load modifier into memory (seems to work even if called multiple times)
    LinkLuaModifier(artifact.modifier_name, "modifiers/artifacts/" + artifact.modifier_name, LuaModifierMotionType.NONE);
    hero.AddNewModifier(hero, undefined, artifact.modifier_name,undefined);
    print("modifier added to", hero)
}

let players: [PlayerID, CDOTAPlayerController][] = [];

function createTuplePlayerIDController (playerID: PlayerID, controller: CDOTAPlayerController){
    if (!players.includes([playerID, controller])){
        players.push([playerID, controller])
        print("hey")
    }
}

function getPlayerFromID(id: PlayerID){
    for (let i=0; i<players.length; ++i){
        if (players[i][0] == id){
            print("found", players[i]);
            return players[i][1];
        }
    }
    return undefined;
}

function handleRewards(wave: Wave){
    let units = FindUnitsInRadius(
        DotaTeam.GOODGUYS,
        Vector(0,0,0),
        undefined,
        FIND_UNITS_EVERYWHERE,
        UnitTargetTeam.FRIENDLY,
        UnitTargetType.HERO,
        UnitTargetFlags.PLAYER_CONTROLLED,
        FindOrder.ANY,
        false
    )

    for (let unit of units){
        (unit as CDOTA_BaseNPC_Hero).AddExperience(wave.expReward, 0, false, false);
        (unit as CDOTA_BaseNPC_Hero).ModifyGold(wave.goldReward, true, 0);
        // Selecting 3 random artifact  
        let artifactChoices: Artifact[] = pickRandomArtifacts(wave.relicRarity);
        launchArtifactPicker(unit as CDOTA_BaseNPC_Hero, artifactChoices);
        
        let listener = CustomGameEventManager.RegisterListener("heroArtifactPickedEvent",(_,e) => {
            e.artifact.canHaveMultiple = e.artifact.canHaveMultiple
            // Updating Dota Player ID
            createTuplePlayerIDController(unit.GetPlayerOwnerID(), unit.GetPlayerOwner());
            addArtifactToPlayer(new Artifact(
                e.artifact.name,
                e.artifact.modifier_name,
                e.artifact.description,
                e.artifact.image,
                e.artifact.rarity,
                !!e.artifact.canHaveMultiple,
                e.artifact.id
                ), unit.GetPlayerOwnerID());
            // Remove listener once added
            CustomGameEventManager.UnregisterListener(listener)
        })

        for (let reward of wave.itemsReward){
            let player = unit.GetPlayerOwner()
            let item = CreateItem(reward, player, player)
            // TODO: Print item obtained or some custom animation
            if (typeof item !== 'undefined'){
                unit.AddItem(item)
            }
        }
    }
}

function handleVictory(){
    print("You won !")
}

function handleWavesSpawning(waveNumber: number) {
    let currentSecondCount = timeBetweenWaves;
    // TODO: Attendre que les joueurs cliquent sur prêt, ou après 30s
    // en attendant, après 3 secondes:
    Timers.CreateTimer(0,() => {
        // Si le timer n'est pas terminé, on actualise l'affichage
        if (currentSecondCount > 0){
            CustomGameEventManager.Send_ServerToTeam(
                DotaTeam.GOODGUYS, 
                "waveTimerEvent", 
                {
                    waveNumber: waveNumber, 
                    remainingTime: currentSecondCount 
                }
            )
            currentSecondCount -= 1;
            return 1
        }
        // Sinon, on quitte (et on lance la wave)
    });

    // Creating array of possible waves
    let possibleWaves : Wave[] = []
    for (let i=0; i<waves.length; ++i){
        if (waves[i].waveLevel == waveNumber){
            possibleWaves.push(waves[i])
        }
    }

    // If no existing waves for given ID, stop the game (shouldn't happen once every type of wave exists)
    if (possibleWaves.length == 0){
        handleVictory();
        return;
    }
    
    // Selecting a random wave
    let rand = Math.floor(math.random() * Object.keys(possibleWaves).length)

    Timers.CreateTimer(timeBetweenWaves, () => {
        let nbUnitsSpawned = possibleWaves[rand].ennemies.length
        let nbUnitsKilled = 0
        // Pour chaque ennemi dans le tableau choisi aléatoirement,
        for(let i=0; i<nbUnitsSpawned; ++i){
            // TODO: Récupérer les lieux de spawn
            let spawn = Vector(-126.395569, 117.437698, 0.000000);
            let unit = CreateUnitByName(
                possibleWaves[rand].ennemies[i],
                spawn,
                true,
                undefined,
                undefined,
                DotaTeam.BADGUYS
            )
            let entindex = unit.GetEntityIndex()
            ListenToGameEvent("entity_killed", event => {
                if (entindex == event.entindex_killed){
                    nbUnitsKilled += 1
                    //print("One ennemy died. Remaining:", nbUnitsSpawned-nbUnitsKilled);
                    
                    // Updating timer event into ennemy counter
                    CustomGameEventManager.Send_ServerToTeam(
                        DotaTeam.GOODGUYS, 
                        "waveStartedEvent", 
                        {
                            waveNumber: waveNumber, 
                            remainingEnnemies: nbUnitsSpawned - nbUnitsKilled 
                        }
                    )
                        
                    if (nbUnitsKilled == nbUnitsSpawned){
                        handleRewards(possibleWaves[rand])
                        waveNumber += 1;
                        if (maxWaveNumber == waveNumber){
                            handleVictory();
                        }
                        else{
                            //print("Wave done ! Trying to start wave ", currentWave)
                            handleWavesSpawning(waveNumber)
                        }
                    }
                }
            }, undefined)
        }
        // Updating timer event into ennemy counter
        CustomGameEventManager.Send_ServerToTeam(
            DotaTeam.GOODGUYS, 
            "waveStartedEvent", 
            {
                waveNumber: waveNumber, 
                remainingEnnemies: nbUnitsSpawned 
            }
        )
    });
}




@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource("particle", "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf", context);
        PrecacheResource("soundfile", "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts", context);
    }

    public static Activate(this: void) {
        // When the addon activates, create a new instance of this GameMode class.
        GameRules.Addon = new GameMode();
    }
    

    constructor() {
        this.configure();

        // Register event listeners for dota engine events
        ListenToGameEvent("game_rules_state_change", () => this.OnStateChange(), undefined);
    }

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 3);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 0);

        GameRules.SetShowcaseTime(0);
        GameRules.SetHeroSelectionTime(heroSelectionTime);
        GameRules.SetPreGameTime(0);
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();

        // Add 4 bots to lobby in tools
        if (IsInToolsMode() && state == GameState.CUSTOM_GAME_SETUP) {
            Tutorial.AddBot("npc_dota_hero_lina", "", "", false);
        }

        if (state === GameState.CUSTOM_GAME_SETUP) {
            // Automatically skip setup in tools
            if (IsInToolsMode()) {
                Timers.CreateTimer(1, () => {
                    GameRules.FinishCustomGameSetup();
                });
            }
        }

        // Start game once pregame hits
        if (state === GameState.PRE_GAME) {
            Timers.CreateTimer(0.2, () => this.StartGame());
        }
    }

    private StartGame(): void {
        print("Game starting!");
        let waveNumber = 0;
        // Spawn first wave
        
        handleWavesSpawning(waveNumber);
    }
    

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");

        let waveNumber = 0;
        // Spawn first wave
        
        handleWavesSpawning(waveNumber);
    }

}
