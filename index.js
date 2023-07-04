
const https = require('https');
const readline = require('readline');

const url = 'https://mario.nintendo.com/static/f350c31adcd6378b913f7660db299714/7e15c/mario.png';

let speed = 1000;       // Initial speed: 1 second delay between lines
let paused = false;     // Boolean for determining whether to pause the display

https.get(url, (res) => {
    let body = '';
    let content_type = '';

    // Stores the data from the referenced URL into the variable 'body' and passed to the initiated print function
    res.on('data', (chunk) => {
        body += chunk;  
    });

  res.on('end', () => {
    content_type = res.headers['content-type'];

    // This if-else statement determines the type of content from the referenced URL and determines which function to initiate
    if (content_type && content_type.startsWith('text')) {
        console.log('running print text function');
        printTextResource(body);
    } else {
        console.log('running print non-text function');
        printNonTextResource(body);
    }
  });

}).on('error', (err) => {
    console.error(`Error fetching resource: ${err}`);
    process.exit(1);

});

// Function for processing text resources
function printTextResource(text) {
    const lines = text.split('\n');
    const line_count = lines.length;

    const read_line = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    
    process.stdin.on('keypress', (_, key) => {    
        handleKeyPress(key);
    });


    lines.forEach((line, index) => {
        const line_index = index + 1;
        let delay = line_index * speed;

        // Initiates a Node.js function to delay the print out of lines to the console
        setTimeout(() => {

            if (!paused){
                console.log(`${line_index}: ${line}`);
            }

            // This exits the program if there are no more lines to output
            if (line_index === line_count) {
                read_line.close();
                process.exit(0);
            }

        }, delay);     
    });
}

// Function for processing non-text resources
function printNonTextResource(data) {
  const chunk_size = 16;
  const data_size = data.length;

  // Initiates a Node.js function to delay the print out of lines to the console
  const read_line = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  // Implements a process for a keypress event and then calls the 'handleKeyPress' function when a key is pressed
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  
  process.stdin.on('keypress', (_, key) => {
    handleKeyPress(key);
  });

  // Establishes a loop to process the non-text data into a hexadecimal format and print to the console
  for (let line_offset = 0, line_index = 0; line_offset < data_size; line_offset += chunk_size, line_index++) {
    let delay = line_index * speed;

    // Initiates a Node.js function to delay the print out of lines to the console
    setTimeout(() => {

        // Sets the current line portion, processes to hexadecimal, and prints results to console
        if (!paused) {
            const chunk = data.slice(line_offset, line_offset + chunk_size);
            const line_number = line_index + 1;
            const offset_hex = chunk.split('').map(n => n.charCodeAt(0).toString(16).padStart(2, '0')).join('');

            console.log(`${line_number}: ${offset_hex}`);
        }
        if (line_offset + chunk_size >= data_size) {
            read_line.close();
            process.exit(0);
        }
    }, delay);
  }
}

function handleKeyPress(key) {
    if(key.name === 'space') paused = !paused;
    if(key.sequence == '+') speed -= 500;
    if(key.sequence == '-') speed += 500;
    if (speed < 0) speed = 0;
    if(key.ctrl && key.name == 'c') process.exit();
}

