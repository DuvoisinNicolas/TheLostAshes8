import { BaseModifier, registerModifier } from "../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_my_banana extends BaseModifier {
    bonusDamages = 100;

    IsHidden(){
        return false;
    }

    IsDebuff(): boolean {
        return false;
    }

    IsPurgable(): boolean {
        return true;
    }
    OnCreated(): void {     
        print("created")
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ATTACKSPEED_REDUCTION_PERCENTAGE
        ]
    }  

    GetModifierBaseAttack_BonusDamage(): number {
        return this.bonusDamages;
    }
}