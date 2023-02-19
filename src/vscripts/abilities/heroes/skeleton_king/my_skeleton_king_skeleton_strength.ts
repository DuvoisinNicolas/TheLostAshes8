import { registerAbility, BaseAbility, registerModifier, BaseModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_my_skeleton_king_skeleton_strength extends BaseModifier {

    bonus_strength = 0
    max_stacks = 0

    IsHidden(){
        return false;
    }

    IsDebuff(): boolean {
        return false;
    }

    IsPurgable(): boolean {
        return false;
    }

    OnCreated(params: object) : void {
        const ability = this.GetAbility()!;
        this.bonus_strength = ability.GetSpecialValueFor("bonus_strength")
        this.max_stacks = ability.GetSpecialValueFor("max_stacks")
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ON_DEATH,
            ModifierFunction.EXTRA_STRENGTH_BONUS,
        ]
    }

    OnDeath(event: ModifierInstanceEvent): void {
        // +1 if a skeleton dies near
        if (event.unit.GetUnitName() == "npc_my_dota_wraith_king_skeleton_warrior"){
            if (this.GetStackCount() != this.max_stacks){
                this.SetStackCount(this.GetStackCount()+1)
            }
        }
    }

    GetModifierExtraStrengthBonus(): number {
        return this.GetStackCount() * this.bonus_strength
    }
    
}

@registerAbility()
export class my_skeleton_king_skeleton_strength extends BaseAbility
{   
    Spawn(): void {
        if (IsServer()){
            this.SetLevel(1)
        }
    }
    
    OnAbilityUpgrade(){
        let caster = (this.GetCaster() as CDOTA_BaseNPC_Hero);
        caster.AddNewModifier(caster, this, modifier_my_skeleton_king_skeleton_strength.name, {})
    }
    
}