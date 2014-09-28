package org.vindinium.server

case class Hero(
    id: Int,
    token: String,
    name: String,
    userId: Option[String],
    elo: Option[Int],
    pos: Pos,
    lastDir: Option[Dir],
    life: Int,
    gold: Int,
    timedOut: Boolean,
    lastRespawn: Option[Int] = None) {

  def moveTo(p: Pos) = copy(pos = p)

  def drinkBeer =
    if (gold >= -Hero.beerGold) withGold(Hero.beerGold).withLife(Hero.beerLife)
    else this

  def defend = withLife(Hero.defendLife)

  def fightMine = withLife(Hero.mineLife)

  def withLastDir(dir: Dir) = copy(lastDir = Some(dir))

  def withLife(diff: Int) = copy(life = math.max(0, math.min(Hero.maxLife, life + diff)))

  def withGold(diff: Int) = copy(gold = math.max(0, gold + diff))

  def day = {
    val h = withLife(Hero.dayLife)
    if (h.isDead) h.withLife(1) else h
  }

  def reSpawn(p: Pos, turn: Int) = copy(life = Hero.maxLife, pos = p, lastRespawn = Some(turn))

  def setTimedOut = copy(timedOut = true)
  def crashed = timedOut

  def isAlive = life > 0
  def isDead = !isAlive

  def withName(name: String) = copy(name = name)

  def render = s"@$id"
}

object Hero {

  def apply(id: Int, name: String, userId: Option[String], elo: Option[Int], pos: Pos): Hero = Hero(
    id = id,
    token = RandomString(4),
    name = name,
    userId = userId,
    elo = elo,
    pos = pos,
    lastDir = None,
    life = maxLife,
    gold = 0,
    timedOut = false)

  val maxLife = 100
  val beerLife = 50
  val beerGold = -2
  val dayLife = -1
  val mineLife = -20
  val defendLife = -20
}
