package org.jousse
package bot

case class Hero(
    number: Int,
    name: String,
    pos: Pos,
    life: Int = Hero.maxLife,
    gold: Int = 0) {

  def moveTo(p: Pos) = copy(pos = p)

  def drinkBeer = withLife(life + Hero.beerLife)

  def attack(enemy: Hero) = withLife(-Hero.attackLife) -> enemy.withLife(-Hero.defendLife)

  def fightMine = withLife(-Hero.mineLife)

  def withLife(diff: Int) = copy(life = math.max(0, math.min(Hero.maxLife, life + diff)))

  def withGold(diff: Int) = copy(gold = math.max(0, gold + diff))

  def reSpawn(p: Pos) = copy(life = Hero.maxLife, pos = p)

  def isAlive = life >0
  def isDead = !isAlive

  def render = s"@$number"
}

object Hero {

  val maxLife = 100
  val beerLife = 50
  val dayLife = -1
  val mineLife = -40
  val attackLife = -10
  val defendLife = -15
}
