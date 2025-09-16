package main

import (
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/Arc-B/astar-pathfinding-visualizer/internal/pathfinding"
)

func main() {
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Serve static files
	r.Static("/static", "./web/static")
	r.LoadHTMLGlob("web/templates/*")

	// Routes
	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", gin.H{
			"title": "A* Pathfinding Visualizer",
		})
	})

	// API endpoints
	api := r.Group("/api")
	{
		api.POST("/pathfind", handlePathfinding)
		api.GET("/grid/:width/:height", handleCreateGrid)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run("0.0.0.0:" + port)
}

func handlePathfinding(c *gin.Context) {
	var req pathfinding.PathfindingRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format: " + err.Error(),
		})
		return
	}

	log.Printf("Received pathfinding request - Grid: %dx%d, Start: %v, End: %v", 
		req.Grid.Width, req.Grid.Height, req.Grid.Start, req.Grid.End)

	// Basic validation
	if req.Grid.Width <= 0 || req.Grid.Height <= 0 {
		log.Printf("Invalid grid dimensions: %dx%d", req.Grid.Width, req.Grid.Height)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid grid dimensions",
		})
		return
	}

	// Check if start and end points are valid
	if !req.Grid.IsValidPoint(req.Grid.Start) {
		log.Printf("Invalid start point: %v", req.Grid.Start)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid start point",
		})
		return
	}

	if !req.Grid.IsValidPoint(req.Grid.End) {
		log.Printf("Invalid end point: %v", req.Grid.End)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid end point",
		})
		return
	}

	if req.Grid.Start == req.Grid.End {
		log.Printf("Start and end points are the same: %v", req.Grid.Start)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Start and end points cannot be the same",
		})
		return
	}

	// Ensure nodes array is properly sized
	if len(req.Grid.Nodes) != req.Grid.Height {
		log.Printf("Grid nodes height mismatch: expected %d, got %d", req.Grid.Height, len(req.Grid.Nodes))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Grid nodes array height mismatch",
		})
		return
	}

	for i, row := range req.Grid.Nodes {
		if len(row) != req.Grid.Width {
			log.Printf("Grid nodes width mismatch at row %d: expected %d, got %d", i, req.Grid.Width, len(row))
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Grid nodes array width mismatch at row " + string(rune(i)),
			})
			return
		}
	}

	// Set start and end nodes
	req.Grid.Nodes[req.Grid.Start.Y][req.Grid.Start.X].IsStart = true
	req.Grid.Nodes[req.Grid.End.Y][req.Grid.End.X].IsEnd = true

	log.Printf("Starting A* algorithm...")
	// Run A* algorithm
	result := pathfinding.AStar(&req.Grid, req.Heuristic, req.Animate)
	
	log.Printf("A* result - Success: %v, Path length: %.2f, Nodes explored: %d", 
		result.Success, result.PathLength, result.NodesExplored)
	
	c.JSON(http.StatusOK, result)
}

func handleCreateGrid(c *gin.Context) {
	widthStr := c.Param("width")
	heightStr := c.Param("height")
	
	width, err := strconv.Atoi(widthStr)
	if err != nil || width < 5 || width > 100 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid width. Must be between 5 and 100",
		})
		return
	}
	
	height, err := strconv.Atoi(heightStr)
	if err != nil || height < 5 || height > 100 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid height. Must be between 5 and 100",
		})
		return
	}
	
	grid := pathfinding.CreateGrid(width, height)
	
	c.JSON(http.StatusOK, gin.H{
		"grid": grid,
	})
}