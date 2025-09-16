package pathfinding

import "math"

// Point represents a coordinate in the grid
type Point struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// Node represents a node in the pathfinding grid
type Node struct {
	Point       Point   `json:"point"`
	G           float64 `json:"g"`        // Distance from start
	H           float64 `json:"h"`        // Heuristic distance to goal
	F           float64 `json:"f"`        // G + H
	Parent      *Node   `json:"-"`        // Parent node for path reconstruction
	IsWall      bool    `json:"is_wall"`
	IsStart     bool    `json:"is_start"`
	IsEnd       bool    `json:"is_end"`
	IsPath      bool    `json:"is_path"`
	Visited     bool    `json:"visited"`
	InOpenSet   bool    `json:"in_open_set"`
}

// Grid represents the pathfinding grid
type Grid struct {
	Width  int      `json:"width"`
	Height int      `json:"height"`
	Nodes  [][]Node `json:"nodes"`
	Start  Point    `json:"start"`
	End    Point    `json:"end"`
}

// PathfindingRequest represents the request for pathfinding
type PathfindingRequest struct {
	Grid      Grid   `json:"grid"`
	Heuristic string `json:"heuristic"` // "manhattan" or "euclidean"
	Animate   bool   `json:"animate"`   // Whether to return step-by-step animation
}

// PathfindingResponse represents the response from pathfinding
type PathfindingResponse struct {
	Success       bool     `json:"success"`
	Path          []Point  `json:"path"`
	ExploredNodes []Point  `json:"explored_nodes"`
	PathLength    float64  `json:"path_length"`
	NodesExplored int      `json:"nodes_explored"`
	Steps         []Step   `json:"steps,omitempty"` // For animation
}

// Step represents a single step in the pathfinding animation
type Step struct {
	CurrentNode   Point   `json:"current_node"`
	OpenSet       []Point `json:"open_set"`
	ClosedSet     []Point `json:"closed_set"`
	Path          []Point `json:"path,omitempty"`
	IsComplete    bool    `json:"is_complete"`
}

// Heuristic functions
func ManhattanDistance(a, b Point) float64 {
	return math.Abs(float64(a.X-b.X)) + math.Abs(float64(a.Y-b.Y))
}

func EuclideanDistance(a, b Point) float64 {
	dx := float64(a.X - b.X)
	dy := float64(a.Y - b.Y)
	return math.Sqrt(dx*dx + dy*dy)
}

// GetNeighbors returns valid neighboring points
func (g *Grid) GetNeighbors(p Point) []Point {
	neighbors := []Point{}
	directions := []Point{{0, 1}, {1, 0}, {0, -1}, {-1, 0}} // 4-directional movement
	
	for _, dir := range directions {
		newX, newY := p.X+dir.X, p.Y+dir.Y
		
		// Check bounds
		if newX >= 0 && newX < g.Width && newY >= 0 && newY < g.Height {
			// Check if not a wall
			if !g.Nodes[newY][newX].IsWall {
				neighbors = append(neighbors, Point{newX, newY})
			}
		}
	}
	
	return neighbors
}

// IsValidPoint checks if a point is within grid bounds
func (g *Grid) IsValidPoint(p Point) bool {
	return p.X >= 0 && p.X < g.Width && p.Y >= 0 && p.Y < g.Height
}

// ResetGrid clears all pathfinding state
func (g *Grid) ResetGrid() {
	for y := 0; y < g.Height; y++ {
		for x := 0; x < g.Width; x++ {
			node := &g.Nodes[y][x]
			node.G = 0
			node.H = 0
			node.F = 0
			node.Parent = nil
			node.IsPath = false
			node.Visited = false
			node.InOpenSet = false
		}
	}
}