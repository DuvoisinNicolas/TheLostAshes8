class Artifact implements IArtifact {
    name: string;
    modifier_name: string;
    image: string;
    rarity: number;
    canHaveMultiple: boolean;

    constructor (name:string, modifier_name:string, image:string, rarity: number, canHaveMultiple: boolean){
        this.name = name;
        this.modifier_name = modifier_name;
        this.image = image;
        this.rarity = rarity;
        this.canHaveMultiple = canHaveMultiple;
    }
}


class ArtifactPickers {
    parent: Panel;
    artifact1 : Panel;
    artifact2 : Panel;
    artifact3 : Panel;
    artifactLabel1 : LabelPanel;
    artifactLabel2 : LabelPanel;
    artifactLabel3 : LabelPanel;

    constructor(parent: Panel, artifactInfos1: IArtifact, artifactInfos2: IArtifact, artifactInfos3: IArtifact) {
        this.parent = parent;

        parent.BLoadLayoutSnippet("ArtifactPickers");

        this.artifact1 = parent.FindChildrenWithClassTraverse("ArtifactPicker")[0] as Panel;
        this.artifact2 = parent.FindChildrenWithClassTraverse("ArtifactPicker")[1] as Panel;
        this.artifact3 = parent.FindChildrenWithClassTraverse("ArtifactPicker")[2] as Panel;


        this.artifactLabel1 = this.artifact1.FindChildTraverse("Artifact_Name1") as LabelPanel
        this.artifactLabel2 = this.artifact2.FindChildTraverse("Artifact_Name2") as LabelPanel
        this.artifactLabel3 = this.artifact3.FindChildTraverse("Artifact_Name3") as LabelPanel

        this.artifactLabel1.text = artifactInfos1.name;
        this.artifactLabel2.text = artifactInfos2.name;
        this.artifactLabel3.text = artifactInfos3.name;
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
        
        let artifact1Test : IArtifact = new Artifact("TestName1", "test_modifier", "test_image", 1, true);
        let artifact2Test : IArtifact = new Artifact("TestName2", "test_modifier", "test_image", 1, true);
        let artifact3Test : IArtifact = new Artifact("TestName3", "test_modifier", "test_image", 1, true);
        
        new ArtifactPickers(containerArtifacts, artifact1Test, artifact2Test, artifact3Test);  
    }
}
let ui = new ExampleUI($.GetContextPanel());
