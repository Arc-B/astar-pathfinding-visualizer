package pathfinding

import (
	"container/heap"
	"math"
)

// PriorityQueue implements a priority queue for A* algorithm
type PriorityQueue []*Node

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
	return pq[i].F < pq[j].F
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
}

func (pq *PriorityQueue) Push(x interface{}) {
	*pq = append(*pq, x.(*Node))
}

func (pq *PriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	*pq = old[0 : n-1]
	return item
}

// AStar performs the A* pathfinding algorithm
func AStar(grid *Grid, heuristicType string, animate bool) PathfindingResponse {
	// Reset grid state
	grid.ResetGrid()
	
	// Choose heuristic function
	var heuristic func(Point, Point) float64
	switch heuristicType {
	case "euclidean":
		heuristic = EuclideanDistance
	default:
		heuristic = ManhattanDistance
	}
	
	// Initialize start node
	startNode := &grid.Nodes[grid.Start.Y][grid.Start.X]
	startNode.G = 0
	startNode.H = heuristic(grid.Start, grid.End)
	startNode.F = startNode.G + startNode.H
	
	// Priority queue for open set
	openSet := &PriorityQueue{}
	heap.Init(openSet)
	heap.Push(openSet, startNode)
	startNode.InOpenSet = true
	
	// Closed set for visited nodes
	closedSet := make(map[Point]bool)
	
	// Animation steps
	var steps []Step
	exploredNodes := []Point{}
	
	for openSet.Len() > 0 {
		// Get node with lowest F score
		current := heap.Pop(openSet).(*Node)
		current.InOpenSet = false
		currentPoint := current.Point
		
		// Mark as visited
		current.Visited = true
		closedSet[currentPoint] = true
		exploredNodes = append(exploredNodes, currentPoint)
		
		// Check if we reached the goal
		if currentPoint == grid.End {
			path := reconstructPath(current)
			pathLength := calculatePathLength(path)
			
			// Mark path nodes
			for _, p := range path {
				if p != grid.Start && p != grid.End {
					grid.Nodes[p.Y][p.X].IsPath = true
				}
			}
			
			// Add final step for animation
			if animate {
				finalStep := Step{
					CurrentNode: currentPoint,
					OpenSet:     getOpenSetPoints(openSet),
					ClosedSet:   exploredNodes,
					Path:        path,
					IsComplete:  true,
				}
				steps = append(steps, finalStep)
			}
			
			return PathfindingResponse{
				Success:       true,
				Path:          path,
				ExploredNodes: exploredNodes,
				PathLength:    pathLength,
				NodesExplored: len(exploredNodes),
				Steps:         steps,
			}
		}
		
		// Add animation step
		if animate {
			step := Step{
				CurrentNode: currentPoint,
				OpenSet:     getOpenSetPoints(openSet),
				ClosedSet:   exploredNodes,
				IsComplete:  false,
			}
			steps = append(steps, step)
		}
		
		// Explore neighbors
		neighbors := grid.GetNeighbors(currentPoint)
		for _, neighborPoint := range neighbors {
			// Skip if in closed set
			if closedSet[neighborPoint] {
				continue
			}
			
			neighbor := &grid.Nodes[neighborPoint.Y][neighborPoint.X]
			tentativeG := current.G + 1 // Assuming uniform cost of 1
			
			// If not in open set, add it
			if !neighbor.InOpenSet {
				neighbor.Parent = current
				neighbor.G = tentativeG
				neighbor.H = heuristic(neighborPoint, grid.End)
				neighbor.F = neighbor.G + neighbor.H
				neighbor.InOpenSet = true
				heap.Push(openSet, neighbor)
			} else if tentativeG < neighbor.G {
				// Found better path to this neighbor
				neighbor.Parent = current
				neighbor.G = tentativeG
				neighbor.F = neighbor.G + neighbor.H
				// Note: In a more efficient implementation, we'd update the heap here
			}
		}
	}
	
	// No path found
	return PathfindingResponse{
		Success:       false,
		Path:          []Point{},
		ExploredNodes: exploredNodes,
		PathLength:    0,
		NodesExplored: len(exploredNodes),
		Steps:         steps,
	}
}

// reconstructPath builds the path from start to end
func reconstructPath(endNode *Node) []Point {
	path := []Point{}
	current := endNode
	
	for current != nil {
		path = append([]Point{current.Point}, path...)
		current = current.Parent
	}
	
	return path
}

// calculatePathLength calculates the total length of the path
func calculatePathLength(path []Point) float64 {
	if len(path) < 2 {
		return 0
	}
	
	length := 0.0
	for i := 1; i < len(path); i++ {
		length += EuclideanDistance(path[i-1], path[i])
	}
	
	return math.Round(length*100) / 100 // Round to 2 decimal places
}

// getOpenSetPoints extracts points from the open set for animation
func getOpenSetPoints(openSet *PriorityQueue) []Point {
	points := make([]Point, 0, openSet.Len())
	for _, node := range *openSet {
		points = append(points, node.Point)
	}
	return points
}

// CreateGrid creates a new grid with the specified dimensions
func CreateGrid(width, height int) *Grid {
	nodes := make([][]Node, height)
	for y := 0; y < height; y++ {
		nodes[y] = make([]Node, width)
		for x := 0; x < width; x++ {
			nodes[y][x] = Node{
				Point: Point{X: x, Y: y},
			}
		}
	}
	
	return &Grid{
		Width:  width,
		Height: height,
		Nodes:  nodes,
		Start:  Point{X: 0, Y: 0},
		End:    Point{X: width - 1, Y: height - 1},
	}
}