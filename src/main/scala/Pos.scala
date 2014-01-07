package jousse.org
package bot

case class Pos(x: Int, y: Int) {

  def left = copy(x = x - 1)
  def right = copy(x = x + 1)
  def up = copy(y = y - 1)
  def down = copy(y = y + 1)

  def neighbors = Set(left, right, up, down) 
}
