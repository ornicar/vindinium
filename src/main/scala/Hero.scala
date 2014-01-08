package org.jousse
package bot

case class Hero(
    number: Int,
    name: String,
    pos: Pos,
    life: Int = Hero.maxLife,
    gold: Int = 0) {

  def moveTo(p: Pos) = copy(pos = p)

  def drinkBeer = withLife(life + Hero.beerEffect)

  def fight(enemy: Hero) = withLife(-enemy.life) -> enemy.withLife(-life)

  def withLife(diff: Int) = copy(life = math.max(0, math.min(Hero.maxLife, life + diff)))

  def reSpawn(p: Pos) = copy(life = Hero.maxLife, pos = p)

  def isAlive = life >0
  def isDead = !isAlive

  def render = s"@$number"
}

object Hero {

  val maxLife = 100
  val beerEffect = 50
}
