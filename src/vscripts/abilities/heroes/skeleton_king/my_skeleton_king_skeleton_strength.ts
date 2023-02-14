import { registerAbility, BaseAbility, registerModifier, BaseModifier } from "../../../lib/dota_ts_adapter";

@registerModifier()
export class modifier_my_skeleton_king_skeleton_strength extends BaseModifier {

    bonus_strength = 0
    stack_count = 0
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
        print(this.bonus_strength);
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ON_DEATH,
            ModifierFunction.EXTRA_STRENGTH_BONUS
        ]
    }

    OnDeath(event: ModifierInstanceEvent): void {
        if (event.unit.GetUnitName() == "npc_my_dota_wraith_king_skeleton_warrior"){
            if (this.stack_count != this.max_stacks){
                this.stack_count += 1
                this.SetStackCount(this.stack_count)
            }
        }
    }

    GetModifierExtraStrengthBonus(): number {
        return this.stack_count * this.bonus_strength
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