package model.cards.implementation;

import java.util.List;

import model.abilities.Ability;
import model.enums.Faction;
import model.enums.TargetSubtype;

public class Item extends CardImplementation {

	protected Item(Item item) {
		super(item);
	}

	public Item(List<Ability> abilities, Faction faction, int cost, String name, String code, String description) {
		super(abilities, faction, cost, name, code, description);
	}

	@Override
	public void takeMessage(String message) {

	}

	@Override
	public void alert(TargetSubtype subtype) {

	}

	@Override
	public Item copy() {
		return new Item(this);
	}
}
