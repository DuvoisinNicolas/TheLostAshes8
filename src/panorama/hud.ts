
// Shouldn't be used ? UI doesn't create artifacts
class Artifact implements IArtifact {
    id: number;
    name: string;
    modifier_name: string;
    description: string;
    image: string;
    rarity: number;
    canHaveMultiple: boolean;

    constructor (id:number, name:string, modifier_name:string, description:string, image:string, rarity: number, canHaveMultiple: boolean){
        this.id = id;
        this.name = name;
        this.modifier_name = modifier_name;
        this.description = description;
        this.image = image;
        this.rarity = rarity;
        this.canHaveMultiple = canHaveMultiple;
    }
}


/**
 * Turn a table object into an array.
 * @param obj The object to transform to an array.
 * @returns An array with items of the value type of the original object.
 */
function toArray<T>(obj: Record<number, T>): T[] {
    const result = [];
    
    let key = 1;
    while (obj[key]) {
        result.push(obj[key]);
        key++;
    }

    return result;
}


class ArtifactPickers {
    parent: Panel;
    artifact1 : Panel;
    artifact2 : Panel;
    artifact3 : Panel;
    artifactLabel1 : LabelPanel;
    artifactLabel2 : LabelPanel;
    artifactLabel3 : LabelPanel;
    artifactImage1 : ImagePanel;
    artifactImage2 : ImagePanel;
    artifactImage3 : ImagePanel;
    artifactDescription1 : LabelPanel;
    artifactDescription2 : LabelPanel;
    artifactDescription3 : LabelPanel;

    constructor(parent: Panel) {
        this.parent = parent;

        parent.BLoadLayoutSnippet("ArtifactPickers");

        this.artifact1 = parent.FindChildrenWithClassTraverse("ArtifactPicker")[0] as Panel;
        this.artifact2 = parent.FindChildrenWithClassTraverse("ArtifactPicker")[1] as Panel;
        this.artifact3 = parent.FindChildrenWithClassTraverse("ArtifactPicker")[2] as Panel;

        // Setting up elements
        this.artifactLabel1 = this.artifact1.FindChildTraverse("Artifact_Name1") as LabelPanel
        this.artifactLabel2 = this.artifact2.FindChildTraverse("Artifact_Name2") as LabelPanel
        this.artifactLabel3 = this.artifact3.FindChildTraverse("Artifact_Name3") as LabelPanel

        this.artifactImage1 = this.artifact1.FindChildTraverse("Artifact_Image1") as ImagePanel
        this.artifactImage2 = this.artifact2.FindChildTraverse("Artifact_Image2") as ImagePanel
        this.artifactImage3 = this.artifact3.FindChildTraverse("Artifact_Image3") as ImagePanel

        this.artifactDescription1 = this.artifact1.FindChildTraverse("Artifact_Description1") as LabelPanel
        this.artifactDescription2 = this.artifact2.FindChildTraverse("Artifact_Description2") as LabelPanel
        this.artifactDescription3 = this.artifact3.FindChildTraverse("Artifact_Description3") as LabelPanel

        this.hideArtifactPicker();
        GameEvents.Subscribe<HeroArtefactPickingEventData>("heroArtifactPickingEvent", (event) => {
            let artifact1:IArtifact = new Artifact(event.artifact1.id, event.artifact1.name, event.artifact1.modifier_name, event.artifact1.description, event.artifact1.image, event.artifact1.rarity, !!event.artifact1.canHaveMultiple);
            let artifact2:IArtifact = new Artifact(event.artifact2.id, event.artifact2.name, event.artifact2.modifier_name, event.artifact2.description, event.artifact2.image, event.artifact2.rarity, !!event.artifact2.canHaveMultiple);
            let artifact3:IArtifact = new Artifact(event.artifact3.id, event.artifact3.name, event.artifact3.modifier_name, event.artifact3.description, event.artifact3.image, event.artifact3.rarity, !!event.artifact1.canHaveMultiple);
            this.handlehHeroArtifactPickingEvent(event.hero, artifact1, artifact2, artifact3)
        });

        this.artifact1.SetPanelEvent("onmouseover", () => {this.artifact1.AddClass("hoverpanel")})
        this.artifact1.SetPanelEvent("onmouseout", () => {this.artifact1.RemoveClass("hoverpanel")})
        this.artifact2.SetPanelEvent("onmouseover", () => {this.artifact2.AddClass("hoverpanel")})
        this.artifact2.SetPanelEvent("onmouseout", () => {this.artifact2.RemoveClass("hoverpanel")})
        this.artifact3.SetPanelEvent("onmouseover", () => {this.artifact3.AddClass("hoverpanel")})
        this.artifact3.SetPanelEvent("onmouseout", () => {this.artifact3.RemoveClass("hoverpanel")})
    }


    setArtifactPickers(heroid: PlayerID, artifactInfos1: IArtifact, artifactInfos2: IArtifact, artifactInfos3: IArtifact){
        // Creating elements
        this.artifactLabel1.text = artifactInfos1.name;
        this.artifactLabel2.text = artifactInfos2.name;
        this.artifactLabel3.text = artifactInfos3.name;

        this.artifactImage1.SetImage("file://{images}/custom_game/" + artifactInfos1.image);
        this.artifactImage2.SetImage("file://{images}/custom_game/" + artifactInfos2.image);
        this.artifactImage3.SetImage("file://{images}/custom_game/" + artifactInfos3.image);

        this.artifactDescription1.text = artifactInfos1.description;
        this.artifactDescription2.text = artifactInfos2.description;
        this.artifactDescription3.text = artifactInfos3.description;

        this.artifact1.SetPanelEvent("onmouseactivate",() => this.pickArtifact(heroid, artifactInfos1))
        this.artifact2.SetPanelEvent("onmouseactivate",() => this.pickArtifact(heroid, artifactInfos2))
        this.artifact3.SetPanelEvent("onmouseactivate",() => this.pickArtifact(heroid, artifactInfos3))
    }

    handlehHeroArtifactPickingEvent(heroId: PlayerID, artifact1: IArtifact, artifact2: IArtifact, artifact3: IArtifact){
        this.setArtifactPickers(heroId, artifact1, artifact2, artifact3)
        this.showArtifactPicker();
    } 
    
    pickArtifact(playerID: PlayerID, artifact: IArtifact){
        $.Msg("Trying to add", artifact);
        this.hideArtifactPicker();
        this.artifact1.ClearPanelEvent("onmouseactivate")
        this.artifact2.ClearPanelEvent("onmouseactivate")
        this.artifact3.ClearPanelEvent("onmouseactivate")
        GameEvents.SendCustomGameEventToServer("heroArtifactPickedEvent", {
            player: playerID,
            artifact: artifact
        })
    }

    showArtifactPicker(){
        this.parent.visible = true;
    }

    hideArtifactPicker(){
        this.parent.visible = false;
    }
}

class GameProgression {
    // Instance variables
    parent: Panel;
    waveCounterItem: LabelPanel;
    timeBeforeNextWave: LabelPanel;
    

    // ExampleUI constructor
    constructor(parent: Panel, waveCounter: string, timeBeforeNextWave: string) {
        this.parent = parent;

        // Load snippet into panel
        parent.BLoadLayoutSnippet("GameProgression");
        
        this.waveCounterItem = parent.FindChildTraverse("WaveCounter") as LabelPanel;
        this.timeBeforeNextWave = parent.FindChildTraverse("TimeBeforeNextWave") as LabelPanel

        this.waveCounterItem.text = waveCounter;
        this.timeBeforeNextWave.text = timeBeforeNextWave;
        
        GameEvents.Subscribe<WaveTimerEventData>("waveTimerEvent", (event) => this.OnTimerChanged(event));
        GameEvents.Subscribe<WaveStartedEventData>("waveStartedEvent", (event) => this.OnEnnemyCounterChanged(event));
    }

    OnTimerChanged(event:WaveTimerEventData) {
        this.waveCounterItem.text = "Wave " + (event.waveNumber+1);
        this.timeBeforeNextWave.text = "Starting in: " + event.remainingTime;
    }

    OnEnnemyCounterChanged(event: WaveStartedEventData){
        this.waveCounterItem.text = "Wave " + (event.waveNumber+1);
        this.timeBeforeNextWave.text = "Remaining: " + event.remainingEnnemies;
    }

    // TODO: evenement quand tout le monde à dit qu'il est prêt pour skip le timer
}

class ExampleUI {
    // Instance variables
    panel: Panel;

    constructor(panel: Panel) {
        this.panel = panel;
        const containerTimers = panel.FindChild("GameProgressionPanel")!
        const containerArtifacts = panel.FindChild("ArtifactPickersPanel")!
                
        new GameProgression(containerTimers, "", "");  
        
        new ArtifactPickers(containerArtifacts);  
    }
}

let ui = new ExampleUI($.GetContextPanel());
