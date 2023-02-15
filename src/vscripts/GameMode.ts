import { reloadable } from "./lib/tstl-utils";
import { modifier_panic } from "./modifiers/modifier_panic";

const heroSelectionTime = 20;

declare global {
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}

const waves_rewards = [
    // EXP reward, Gold reward, and items to put in inventory
    // Wave 1
    [
        [500, 1000, "item_greater_crit"],
        [600, 1500, "item_refresher"]
    ],
    // Wave 2
    [
        [500, 1000, "item_greater_crit"],
        [500, 1500, "item_refresher"]
    ]
]

const waves = [
    // Wave 1
    [
        ["npc_my_dota_wraith_king_skeleton_warrior", "npc_my_dota_wraith_king_skeleton_warrior"],
        ["npc_my_dota_wraith_king_skeleton_warrior", "npc_my_dota_wraith_king_skeleton_warrior", "npc_my_dota_wraith_king_skeleton_warrior"]
    ],
    // Wave 2
    [
        ["npc_my_dota_wraith_king_skeleton_warrior"],
        ["npc_my_dota_wraith_king_skeleton_warrior"]
    ]
]
const maxWaveNumber = waves.length
let currentWave = 0

function handleRewards(currentWave: number){
    let rand = Math.floor(math.random() * Object.keys(waves_rewards[currentWave]).length)
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
    let gived_exp = false
    let gived_golds = false
    for (let unit of units){
        for (let reward of waves_rewards[currentWave][rand]){
            // index 0
            if (!gived_exp){
                // Give EXP
                if (typeof reward === "number"){
                    (unit as CDOTA_BaseNPC_Hero).AddExperience(reward, 0, false, false)
                    gived_exp = true
                }
            }
            // index 1
            else if (!gived_golds){
                // Give golds
                if (typeof reward === "number"){
                    (unit as CDOTA_BaseNPC_Hero).ModifyGold(reward, true, 0)
                    gived_golds = true
                }
            }
            // Others (it)
            else{
                if (typeof reward == 'string' ){
                    let player = unit.GetPlayerOwner()
                    let item = CreateItem(reward, player, player)
                    if (typeof item !== 'undefined'){
                        unit.AddItem(item)
                    }
                    
                }
            }
        }

    }
}

function handleVictory(){
    print("You won !")
}

function handleWavesSpawning(waveNumber: number) {
    let rand = Math.floor(math.random() * Object.keys(waves[waveNumber]).length)
    // TODO: Attendre que les joueurs cliquent sur prêt, ou après 30s
    // en attendant, après 3 secondes:
    Timers.CreateTimer(3, () => {
        let nbUnitsSpawned = waves[waveNumber][rand].length
        let nbUnitsKilled = 0
        // Pour chaque ennemi dans le tableau choisi aléatoirement,
        for(let i=0; i<nbUnitsSpawned; ++i){
            // TODO: Récupérer les lieux de spawn
            let spawn = Vector(-126.395569, 117.437698, 0.000000);
            let unit = CreateUnitByName(
                waves[waveNumber][rand][i],
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
                        
                    if (nbUnitsKilled == nbUnitsSpawned){
                        handleRewards(currentWave)
                        currentWave += 1;
                        if (maxWaveNumber == currentWave){
                            handleVictory();
                        }
                        else{
                            //print("Wave done ! Trying to start wave ", currentWave)
                            handleWavesSpawning(currentWave)
                        }
                    }
                }
            }, undefined)
        }
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

        // Do some stuff here
    }

}
