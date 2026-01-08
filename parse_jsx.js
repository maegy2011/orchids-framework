const fs = require('fs');
const content = fs.readFileSync('src/app/watch/[id]/WatchClient.tsx', 'utf8');

const stack = [];
const lines = content.split('\n');

function getLineNumber(index) {
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
        const lineLen = lines[i].length + 1;
        if (count + lineLen > index) return i + 1;
        count += lineLen;
    }
    return -1;
}

// Improved state machine for JSX
let i = 0;
while (i < content.length) {
    // Skip comments
    if (content[i] === '/' && content[i+1] === '*') {
        i += 2;
        while (i < content.length && !(content[i] === '*' && content[i+1] === '/')) i++;
        i += 2;
        continue;
    }
    if (content[i] === '/' && content[i+1] === '/') {
        i += 2;
        while (i < content.length && content[i] !== '\n') i++;
        continue;
    }

    if (content[i] === '<') {
        let j = i + 1;
        // Skip fragments <>
        if (content[j] === '>') {
            stack.push({ name: 'fragment', line: getLineNumber(i) });
            i = j + 1;
            continue;
        }
        // Skip closing fragments </>
        if (content[j] === '/' && content[j+1] === '>') {
            const last = stack.pop();
            if (last.name !== 'fragment') console.log(`Mismatch: expected </${last.name}>, found </> at line ${getLineNumber(i)}`);
            i = j + 2;
            continue;
        }

        const isClosing = content[j] === '/';
        if (isClosing) j++;

        // Find tag name
        let start = j;
        while (j < content.length && /[a-zA-Z0-9\.]/.test(content[j])) j++;
        const tagName = content.substring(start, j);

        if (!tagName || /^[0-9]/.test(tagName)) {
            i++;
            continue;
        }

        // Find end of tag
        let k = j;
        let isSelfClosing = false;
        let inString = false;
        let quoteChar = '';
        let braceLevel = 0;
        while (k < content.length) {
            if (!inString) {
                if (content[k] === '"' || content[k] === "'") {
                    inString = true;
                    quoteChar = content[k];
                } else if (content[k] === '`') {
                    inString = true;
                    quoteChar = '`';
                } else if (content[k] === '{') {
                    braceLevel++;
                } else if (content[k] === '}') {
                    braceLevel--;
                } else if (braceLevel === 0 && content[k] === '/' && content[k+1] === '>') {
                    isSelfClosing = true;
                    k++;
                    break;
                } else if (braceLevel === 0 && content[k] === '>') {
                    break;
                }
            } else {
                if (content[k] === quoteChar) {
                    // Check for escape
                    let backslashes = 0;
                    let m = k - 1;
                    while (m >= 0 && content[m] === '\\') { backslashes++; m--; }
                    if (backslashes % 2 === 0) inString = false;
                }
            }
            k++;
        }

        const line = getLineNumber(i);
        // Ignore known TS generics or non-tags
        if (['VideoDetails', 'VideoNote', 'HTMLDivElement', 'number', 'string', 'any', 'T'].includes(tagName)) {
            i = k + 1;
            continue;
        }

        if (isSelfClosing) {
            // OK
        } else if (isClosing) {
            if (stack.length === 0) {
                console.log(`Unexpected closing tag </${tagName}> at line ${line}`);
            } else {
                const last = stack.pop();
                if (last.name !== tagName) {
                    console.log(`Mismatch: expected </${last.name}> (from line ${last.line}), found </${tagName}> at line ${line}`);
                }
            }
        } else {
            stack.push({ name: tagName, line });
        }
        i = k + 1;
    } else {
        i++;
    }
}

stack.forEach(t => console.log(`Unclosed <${t.name}> from line ${t.line}`));
