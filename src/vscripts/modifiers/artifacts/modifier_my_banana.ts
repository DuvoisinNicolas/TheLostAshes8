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

    RemoveOnDeath(): boolean{
        return false;
    }

    IsPermanent(): boolean{
        return true;
    }


    OnCreated(): void {     
        print("created")
        this.SetStackCount(1)
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.BASEATTACK_BONUSDAMAGE,
            ModifierFunction.ON_MODIFIER_ADDED
        ]
    }

    GetModifierBaseAttack_BonusDamage(): number {
        return this.bonusDamages * this.GetStackCount();
    }
}