# 🚗 A* Pathfinding Visualizer

An interactive web-based visualization of the A* pathfinding algorithm, designed to demonstrate core concepts used in autonomous vehicle navigation systems.

![A* Pathfinding Visualizer Demo](https://via.placeholder.com/800x400/667eea/ffffff?text=A*+Pathfinding+Visualizer)

## 🌟 Features

- **Interactive Grid Interface**: Click and drag to create obstacles, set start/end points
- **Real-time Visualization**: Watch the A* algorithm explore nodes step-by-step
- **Multiple Heuristics**: Choose between Manhattan and Euclidean distance functions
- **Customizable Parameters**: Adjust grid size, animation speed, and visualization options
- **Professional UI**: Modern, responsive design with smooth animations
- **Algorithm Statistics**: View path length, nodes explored, and performance metrics

## 🚀 Live Demo

[**Try the live demo here**](your-deployment-url-here) *(Add your deployment URL)*

## 🛠️ Technology Stack

- **Backend**: Go (Golang) with Gin web framework
- **Frontend**: Vanilla JavaScript with HTML5 Canvas
- **Styling**: Modern CSS with gradients and animations
- **Algorithm**: A* pathfinding with priority queue implementation
- **Architecture**: RESTful API design

## 🎯 Autonomous Driving Relevance

This project demonstrates key concepts used in autonomous vehicle navigation:

- **Path Planning**: Finding optimal routes while avoiding obstacles
- **Real-time Processing**: Algorithm efficiency for time-critical applications
- **Heuristic Optimization**: Balancing accuracy vs. computational cost
- **Sensor Fusion Simulation**: Grid represents processed sensor data (LiDAR, cameras)
- **Dynamic Obstacle Handling**: Interactive obstacle placement mimics real-world scenarios

## 🏃‍♂️ Quick Start

### Prerequisites
- Go 1.19 or higher
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/astar-pathfinding-visualizer.git
cd astar-pathfinding-visualizer

# Install dependencies
go mod tidy

# Run the server
go run cmd/main.go
```

Open your browser and navigate to `http://localhost:8080`

### Docker Setup (Optional)

```bash
# Build and run with Docker
docker build -t astar-visualizer .
docker run -p 8080:8080 astar-visualizer
```

## 🎮 How to Use

1. **Set Start Point**: Right-click on any grid cell to place the green start point
2. **Set End Point**: Ctrl+Click (Cmd+Click on Mac) to place the red end point
3. **Create Obstacles**: Left-click and drag to paint walls/obstacles
4. **Configure Settings**: Choose heuristic, grid size, and animation speed
5. **Find Path**: Click "Find Path" to run the A* algorithm
6. **Watch Magic**: See the algorithm explore nodes and find the optimal path!

### Keyboard Shortcuts
- **Spacebar**: Start pathfinding
- **R**: Reset grid
- **ESC**: Clear current path

## 🧮 Algorithm Details

### A* Algorithm Implementation
- **Open Set**: Priority queue for unexplored nodes
- **Closed Set**: Hash set for visited nodes  
- **Heuristic Functions**: Manhattan and Euclidean distance
- **Path Reconstruction**: Backtracking through parent pointers
- **Optimization**: Early termination when goal is reached

### Performance Characteristics
- **Time Complexity**: O(b^d) where b is branching factor, d is depth
- **Space Complexity**: O(b^d) for storing explored nodes
- **Optimality**: Guaranteed to find shortest path with admissible heuristic

## 📁 Project Structure

```
├── cmd/
│   └── main.go                 # Application entry point
├── internal/
│   └── pathfinding/
│       ├── astar.go           # A* algorithm implementation
│       └── types.go           # Data structures and types
├── web/
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css      # Modern styling
│   │   └── js/
│   │       └── app.js         # Frontend logic and Canvas rendering
│   └── templates/
│       └── index.html         # Main application interface
├── go.mod                     # Go module dependencies
├── go.sum                     # Dependency checksums
└── README.md                  # Project documentation
```

## 🔧 API Endpoints

### POST `/api/pathfind`
Execute pathfinding algorithm
```json
{
  "grid": { /* Grid configuration */ },
  "heuristic": "manhattan|euclidean",
  "animate": true
}
```

### GET `/api/grid/:width/:height`
Generate new grid with specified dimensions

## 🎨 Customization

### Adding New Heuristics
1. Implement heuristic function in `internal/pathfinding/types.go`
2. Add option to frontend dropdown in `index.html`
3. Update algorithm selection in `astar.go`

### Styling Modifications
- Colors: Modify `colors` object in `app.js`
- Layout: Update CSS Grid and Flexbox in `style.css`
- Animations: Adjust CSS transitions and keyframes

## 🚀 Deployment Options

### Heroku
```bash
# Create Procfile
echo "web: ./astar-pathfinding-visualizer" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Docker
```dockerfile
FROM golang:1.19-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o main cmd/main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
COPY --from=builder /app/web ./web
CMD ["./main"]
EXPOSE 8080
```

## 📈 Performance Optimizations

- **Priority Queue**: Efficient heap implementation for O(log n) operations
- **Hash Set**: O(1) lookup for visited nodes
- **Canvas Optimization**: Minimized redraws and efficient rendering
- **Memory Management**: Proper cleanup of animation frames and event listeners

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the need for visual algorithm education
- Built for autonomous vehicle navigation learning
- Created as part of algorithm visualization portfolio

---

**⭐ Star this repository if you found it helpful!**

**🔗 Connect with me:** [LinkedIn](https://linkedin.com/in/your-profile) | [Portfolio](https://your-portfolio.com)