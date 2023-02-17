

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


}

class ExampleUI {
    // Instance variables
    panel: Panel;

    // ExampleUI constructor
    constructor(panel: Panel) {
        this.panel = panel;
        const container = panel.FindChild("GameProgressionPanel")!
        const progression = new GameProgression(container, "Wave 1", "Starting in: 30");  
    }
}
let ui = new ExampleUI($.GetContextPanel());
