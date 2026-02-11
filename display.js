const upload = document.getElementById('upload');
const tileSizeInput = document.getElementById('tileSize');
const displayWidth = 64;
const rowInput = document.getElementById('row_num');
const colInput = document.getElementById('col_num');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tiles_display = document.getElementById('tiles_display');
const tiles_ctx = tiles_display.getContext('2d');

const gap = 4;
const paddedSize = displayWidth + gap;

let spriteSheet = new Image();
const default_image = "assets/nature_tiles.png";
spriteSheet.src = default_image;

let current_display = []; //array of tiles displayed

// Refresh view when any input changes
[tileSizeInput, rowInput, colInput].forEach(input => {
    input.addEventListener('input', draw_tiles_display);
});

upload.onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        spriteSheet.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

spriteSheet.onload = () => {
    tiles_display.height = tiles_display.width;
    draw_tiles_display();
}

//clicker
tiles_display.addEventListener("click", (e) => {
    const rect = tiles_display.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const colClicked = Math.floor((mouseX-gap) / paddedSize);
    const rowClicked = Math.floor((mouseY - gap) / paddedSize);

    // Ensure click is within the 3 columns
    if (colClicked >= 0 && colClicked < 3) {
        const displayIndex = colClicked + (rowClicked * 3);
        add_to_main_canvas(displayIndex);
    }
});

function draw_tiles_display() {
    if (!spriteSheet.src) return;

    const size = parseInt(tileSizeInput.value);
    const cols = parseInt(colInput.value);
    const rows = parseInt(rowInput.value);
    const total_tiles = cols * rows;

    const displayRows = Math.ceil(total_tiles/3);
    tiles_display.width = paddedSize * 3 + gap;
    tiles_display.height = paddedSize * displayRows + gap;
    // Clear and draw
    tiles_ctx.clearRect(0, 0, tiles_display.width, tiles_display.height);
    tiles_ctx.imageSmoothingEnabled = false;
    let displayIndex = 0;
    
    //3x3 blocks loop
    for(let y = 0; y < rows; y += 3) {
        for (let x = 0; x < cols; x += 3) {
            //within each 3x3
            for(let local_y = 0; local_y < 3; local_y++) {
                for (let local_x = 0; local_x < 3; local_x++) {
                    //current/actual x, y
                    const curX = x + local_x;
                    const curY = y + local_y;
                    if (curX < cols && curY < rows) {
                        //source x, y
                        const sx = curX * size;
                        const sy = curY * size;
                        //destination x, y
                        const dx = (displayIndex % 3) * paddedSize + gap;
                        const dy = Math.floor(displayIndex/3) * paddedSize + gap;
                        tiles_ctx.drawImage(
                            spriteSheet, 
                            sx, sy, size, size,     // Source
                            dx, dy, displayWidth, displayWidth // Destination
                        );
                        displayIndex++;
                    }
                }
            }
        }
    }
}

function clear_main_canvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    current_display = [];
}

function add_to_main_canvas(displayIdx) {

    if (current_display.length < 36) {
        current_display.push(displayIdx);
        draw_main_canvas();
    }
}

function back_one_step() {
    current_display.pop();
    draw_main_canvas();
}

function draw_main_canvas() { 
    const size = parseInt(tileSizeInput.value);
    const cols = parseInt(colInput.value);
    const rows = parseInt(rowInput.value);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    
    current_display.forEach((displayIdx, i) => {
        //source x, y
        let currentIndex = 0;
        let sx = 0;
        let sy = 0;
        let found = false;

        for(let y = 0; y < rows && !found; y += 3) {
            for (let x = 0; x < cols && !found; x += 3) {
                for(let local_y = 0; local_y < 3 && !found; local_y++) {
                    for (let local_x = 0; local_x < 3 && !found; local_x++) {
                        if (x + local_x < cols && y + local_y < rows) {
                            if (currentIndex === displayIdx) {
                                sx = (x + local_x) * size;
                                sy = (y + local_y) * size;
                                found = true;
                            }
                            currentIndex++;
                        }
                    }
                }
            }
        }
        if (found) {
            //destination x, y
            const dx = (i % 6) * displayWidth;
            const dy = Math.floor(i/6) * displayWidth;

            ctx.drawImage(
                spriteSheet, 
                sx, sy, size, size,     // Source
                dx, dy, displayWidth, displayWidth // Destination
            );
        }


    });
}