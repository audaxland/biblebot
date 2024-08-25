import fs from 'fs';

const start_time = new Date();
export const logger = (...messages) => {
    const elapsedSeconds = (new Date() - start_time) / 1000;
    const elapsedTime = (Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')) + ':'
                             + (Math.floor(elapsedSeconds % 60).toString().padStart(2, '0'));
    console.log('###', ...messages, '### Time elapsed: ' + elapsedTime);
}

export const parseBibleFile = path => {
    const inputFile = fs.readFileSync(path, 'utf8').split('\n');
    return inputFile.map((line, verseIndex) => {
        const extract = line.match(/^([^:]+)\s+(\d+):(\d+)(.*)$/);
        if (!extract) return null;
        return {
            verseIndex: verseIndex,
            book: extract[1].trim(),
            chapter: parseInt(extract[2]),
            verse: parseInt(extract[3]),
            text: extract[4].trim()
        }
    }).filter(item => item && item.text && item.text.length > 0); // remove empty lines and invalid lines
}

