class PathfindingVisualizer {
    constructor() {
        this.canvas = document.getElementById('gridCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 30;
        this.cellSize = 15;
        this.grid = null;
        this.isMouseDown = false;
        this.isDrawing = false;
        this.animationId = null;
        this.animationSteps = [];
        this.currentStep = 0;
        this.animationSpeed = 5;
        
        // Colors
        this.colors = {
            empty: '#ffffff',
            wall: '#333333',
            start: '#4CAF50',
            end: '#f44336',
            explored: '#87CEEB',
            path: '#FFD700',
            openSet: '#90EE90',
            current: '#FF6B6B'
        };
        
        this.initializeCanvas();
        this.createGrid();
        this.bindEvents();
        this.updateStats();
        
        // Debug: Log initial state
        console.log('PathfindingVisualizer initialized');
        console.log('Initial grid state:', this.grid);
        
        // Test button for debugging
        this.addDebugButton();
    }
    
    initializeCanvas() {
        const size = this.gridSize * this.cellSize;
        this.canvas.width = size;
        this.canvas.height = size;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
    }
    
    createGrid() {
        this.grid = {
            width: this.gridSize,
            height: this.gridSize,
            start: { x: 1, y: 1 },
            end: { x: this.gridSize - 2, y: this.gridSize - 2 },
            nodes: []
        };
        
        // Initialize nodes
        for (let y = 0; y < this.gridSize; y++) {
            this.grid.nodes[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.grid.nodes[y][x] = {
                    point: { x, y },
                    is_wall: false,
                    is_start: x === this.grid.start.x && y === this.grid.start.y,
                    is_end: x === this.grid.end.x && y === this.grid.end.y,
                    is_path: false,
                    visited: false,
                    in_open_set: false
                };
            }
        }
        
        console.log('Grid created with start:', this.grid.start, 'end:', this.grid.end);
        this.draw();
    }
    
    bindEvents() {
        // Canvas mouse events
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        
        // Button events
        document.getElementById('findPath').addEventListener('click', this.findPath.bind(this));
        document.getElementById('clearPath').addEventListener('click', this.clearPath.bind(this));
        document.getElementById('clearWalls').addEventListener('click', this.clearWalls.bind(this));
        document.getElementById('generateMaze').addEventListener('click', this.generateMaze.bind(this));
        document.getElementById('resetGrid').addEventListener('click', this.resetGrid.bind(this));
        
        // Control events
        document.getElementById('gridWidth').addEventListener('change', this.onGridSizeChange.bind(this));
        document.getElementById('animationSpeed').addEventListener('input', this.onSpeedChange.bind(this));
        
        // Keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: Math.floor((e.clientX - rect.left) * scaleX / this.cellSize),
            y: Math.floor((e.clientY - rect.top) * scaleY / this.cellSize)
        };
    }
    
    onMouseDown(e) {
        this.isMouseDown = true;
        const pos = this.getMousePos(e);
        
        if (pos.x < 0 || pos.x >= this.gridSize || pos.y < 0 || pos.y >= this.gridSize) return;
        
        if (e.button === 2) { // Right click - set start
            this.setStart(pos.x, pos.y);
        } else if (e.ctrlKey) { // Ctrl + click - set end
            this.setEnd(pos.x, pos.y);
        } else { // Left click - toggle wall
            this.toggleWall(pos.x, pos.y);
            this.isDrawing = true;
        }
    }
    
    onMouseMove(e) {
        if (!this.isMouseDown || !this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        if (pos.x < 0 || pos.x >= this.gridSize || pos.y < 0 || pos.y >= this.gridSize) return;
        
        this.toggleWall(pos.x, pos.y);
    }
    
    onMouseUp() {
        this.isMouseDown = false;
        this.isDrawing = false;
    }
    
    onKeyDown(e) {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.findPath();
                break;
            case 'r':
            case 'R':
                this.resetGrid();
                break;
        }
    }
    
    setStart(x, y) {
        // Clear previous start
        const oldStart = this.grid.start;
        this.grid.nodes[oldStart.y][oldStart.x].is_start = false;
        
        // Set new start
        this.grid.start = { x, y };
        this.grid.nodes[y][x].is_start = true;
        this.grid.nodes[y][x].is_wall = false;
        
        this.draw();
        console.log('Start point set to:', { x, y });
    }
    
    setEnd(x, y) {
        // Clear previous end
        const oldEnd = this.grid.end;
        this.grid.nodes[oldEnd.y][oldEnd.x].is_end = false;
        
        // Set new end
        this.grid.end = { x, y };
        this.grid.nodes[y][x].is_end = true;
        this.grid.nodes[y][x].is_wall = false;
        
        this.draw();
        console.log('End point set to:', { x, y });
    }
    
    toggleWall(x, y) {
        const node = this.grid.nodes[y][x];
        if (node.is_start || node.is_end) return;
        
        node.is_wall = !node.is_wall;
        this.draw();
    }
    
    async findPath() {
        this.clearPath();
        this.showLoading(true);
        this.setStatus('Finding path...');
        
        // Log the current grid state for debugging
        console.log('Grid state before pathfinding:', {
            start: this.grid.start,
            end: this.grid.end,
            width: this.grid.width,
            height: this.grid.height,
            startNode: this.grid.nodes[this.grid.start.y][this.grid.start.x],
            endNode: this.grid.nodes[this.grid.end.y][this.grid.end.x]
        });
        
        // Verify start and end are different
        if (this.grid.start.x === this.grid.end.x && this.grid.start.y === this.grid.end.y) {
            console.error('Start and end points are the same!', this.grid.start, this.grid.end);
            this.showMessage('Please set different start and end points', 'error');
            this.showLoading(false);
            return;
        }
        
        try {
            const requestPayload = {
                grid: this.grid,
                heuristic: document.getElementById('heuristic').value,
                animate: document.getElementById('animate').checked
            };
            
            console.log('Sending request:', JSON.stringify(requestPayload, null, 2));
            
            const response = await fetch('/api/pathfind', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestPayload)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unknown error');
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.updateStats(result.path_length, result.nodes_explored);
                
                if (result.steps && result.steps.length > 0) {
                    this.animationSteps = result.steps;
                    this.currentStep = 0;
                    this.animatePathfinding();
                } else {
                    this.displayResult(result);
                }
                
                this.setStatus('Path found!');
                this.showMessage('Path found successfully!', 'success');
            } else {
                this.setStatus('No path found');
                this.showMessage('No path exists between start and end points', 'error');
                this.updateStats(0, result.nodes_explored);
            }
        } catch (error) {
            console.error('Error finding path:', error);
            this.setStatus('Error occurred');
            this.showMessage('Error: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    animatePathfinding() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const animate = () => {
            if (this.currentStep >= this.animationSteps.length) {
                return;
            }
            
            const step = this.animationSteps[this.currentStep];
            
            // Update grid state
            this.clearVisualization();
            
            // Mark explored nodes
            step.closed_set.forEach(point => {
                if (!this.grid.nodes[point.y][point.x].is_start && 
                    !this.grid.nodes[point.y][point.x].is_end) {
                    this.grid.nodes[point.y][point.x].visited = true;
                }
            });
            
            // Mark open set nodes
            step.open_set.forEach(point => {
                if (!this.grid.nodes[point.y][point.x].is_start && 
                    !this.grid.nodes[point.y][point.x].is_end) {
                    this.grid.nodes[point.y][point.x].in_open_set = true;
                }
            });
            
            // Mark path if complete
            if (step.is_complete && step.path) {
                step.path.forEach(point => {
                    if (!this.grid.nodes[point.y][point.x].is_start && 
                        !this.grid.nodes[point.y][point.x].is_end) {
                        this.grid.nodes[point.y][point.x].is_path = true;
                    }
                });
            }
            
            this.draw();
            
            // Highlight current node
            this.drawCell(step.current_node.x, step.current_node.y, this.colors.current);
            
            this.currentStep++;
            
            if (step.is_complete) {
                this.setStatus('Animation complete');
                return;
            }
            
            // Schedule next frame based on animation speed
            const delay = 110 - (this.animationSpeed * 10);
            setTimeout(() => {
                this.animationId = requestAnimationFrame(animate);
            }, delay);
        };
        
        animate();
    }
    
    displayResult(result) {
        // Mark path
        result.path.forEach(point => {
            if (!this.grid.nodes[point.y][point.x].is_start && 
                !this.grid.nodes[point.y][point.x].is_end) {
                this.grid.nodes[point.y][point.x].is_path = true;
            }
        });
        
        // Mark explored nodes
        result.explored_nodes.forEach(point => {
            if (!this.grid.nodes[point.y][point.x].is_start && 
                !this.grid.nodes[point.y][point.x].is_end && 
                !this.grid.nodes[point.y][point.x].is_path) {
                this.grid.nodes[point.y][point.x].visited = true;
            }
        });
        
        this.draw();
    }
    
    clearVisualization() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const node = this.grid.nodes[y][x];
                node.visited = false;
                node.in_open_set = false;
                node.is_path = false;
            }
        }
    }
    
    clearPath() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.clearVisualization();
        this.draw();
        this.setStatus('Ready');
    }
    
    clearWalls() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.grid.nodes[y][x].is_start && !this.grid.nodes[y][x].is_end) {
                    this.grid.nodes[y][x].is_wall = false;
                }
            }
        }
        this.draw();
    }
    
    generateMaze() {
        this.clearWalls();
        
        // Simple random maze generation
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.grid.nodes[y][x].is_start && 
                    !this.grid.nodes[y][x].is_end && 
                    Math.random() < 0.3) {
                    this.grid.nodes[y][x].is_wall = true;
                }
            }
        }
        
        this.draw();
        this.showMessage('Random maze generated!', 'info');
    }
    
    resetGrid() {
        this.clearPath();
        this.createGrid();
        this.updateStats();
        this.setStatus('Ready');
    }
    
    onGridSizeChange(e) {
        this.gridSize = parseInt(e.target.value);
        console.log('Grid size changed to:', this.gridSize);
        this.initializeCanvas();
        this.createGrid();
        this.updateStats();
    }
    
    onSpeedChange(e) {
        this.animationSpeed = parseInt(e.target.value);
        document.getElementById('speedValue').textContent = this.animationSpeed;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const node = this.grid.nodes[y][x];
                let color = this.colors.empty;
                
                if (node.is_wall) color = this.colors.wall;
                else if (node.is_start) color = this.colors.start;
                else if (node.is_end) color = this.colors.end;
                else if (node.is_path) color = this.colors.path;
                else if (node.in_open_set) color = this.colors.openSet;
                else if (node.visited) color = this.colors.explored;
                
                this.drawCell(x, y, color);
            }
        }
        
        // Draw grid lines
        this.drawGridLines();
    }
    
    drawCell(x, y, color) {
        const pixelX = x * this.cellSize;
        const pixelY = y * this.cellSize;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
        
        // Add border for better visibility
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
    }
    
    drawGridLines() {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        
        // Vertical lines
        for (let x = 0; x <= this.gridSize; x++) {
            const pixelX = x * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pixelX, 0);
            this.ctx.lineTo(pixelX, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.gridSize; y++) {
            const pixelY = y * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, pixelY);
            this.ctx.lineTo(this.canvas.width, pixelY);
            this.ctx.stroke();
        }
    }
    
    updateStats(pathLength = '-', nodesExplored = '-') {
        document.getElementById('pathLength').textContent = pathLength;
        document.getElementById('nodesExplored').textContent = nodesExplored;
        document.getElementById('algorithmUsed').textContent = 'A* (' + document.getElementById('heuristic').value + ')';
    }
    
    setStatus(status) {
        document.getElementById('status').textContent = status;
    }
    
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.add('show');
            document.getElementById('findPath').disabled = true;
        } else {
            loading.classList.remove('show');
            document.getElementById('findPath').disabled = false;
        }
    }
    
    showMessage(text, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        document.body.appendChild(message);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
    
    addDebugButton() {
        const debugBtn = document.createElement('button');
        debugBtn.textContent = 'Debug Grid';
        debugBtn.className = 'btn secondary';
        debugBtn.onclick = () => {
            console.log('=== GRID DEBUG INFO ===');
            console.log('Grid object:', this.grid);
            console.log('Start coordinates:', this.grid.start);
            console.log('End coordinates:', this.grid.end);
            console.log('Grid size:', this.gridSize);
            console.log('Start node:', this.grid.nodes[this.grid.start.y][this.grid.start.x]);
            console.log('End node:', this.grid.nodes[this.grid.end.y][this.grid.end.x]);
            
            // Check if visual start/end match data
            let visualStart = null, visualEnd = null;
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    if (this.grid.nodes[y][x].is_start) {
                        visualStart = {x, y};
                    }
                    if (this.grid.nodes[y][x].is_end) {
                        visualEnd = {x, y};
                    }
                }
            }
            console.log('Visual start found at:', visualStart);
            console.log('Visual end found at:', visualEnd);
            console.log('=== END DEBUG INFO ===');
        };
        
        document.querySelector('.action-buttons').appendChild(debugBtn);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PathfindingVisualizer();
});