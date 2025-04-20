let currentDisplayQueue = [];
let currentExampleIndex = 0;
let examplesCount = 'all';
let randomExamples = false;

const audioFiles = {
    audio1: 'audio/audio1.wav',
    audio2: 'audio/audio2.wav',
    audio3: 'audio/audio3.aac',
    audio4: 'audio/audio4.aac',
    audio5: 'audio/audio5.aac'
};
let selectedAudio = 'audio1';
let playAudioBeforeNewWord = true;

const newWordAudio = new Audio(audioFiles[selectedAudio]);

function playNewWordAudio(callback) {
    if (playAudioBeforeNewWord) {
        newWordAudio.src = audioFiles[selectedAudio];
        newWordAudio.play();
        newWordAudio.onended = callback;
    } else {
        callback();
    }
}

function loadTableData() {
    const storedData = localStorage.getItem('studyTableData');
    if (!storedData) return;

    const jsonData = JSON.parse(storedData);
    const table = document.getElementById('wordTable'); // დარწმუნდი, რომ ეს ცხრილის ID-ია
    table.innerHTML = ""; // ცხრილის გასუფთავება

    // **ცხრილის სათაურების დამატება**
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // სათაურების ამოღება პირველ ობიექტიდან
    const headers = Object.keys(jsonData[0]);
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });

    // **"Actions" სვეტის დამატება**
    const actionTh = document.createElement('th');
    actionTh.textContent = "Actions";
    headerRow.appendChild(actionTh);

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // **ცხრილის მონაცემების დამატება**
    const tbody = document.createElement('tbody');

    jsonData.forEach((row, index) => {
        const tr = document.createElement('tr');

        // თითოეული უჯრის დამატება
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });

        // **"Actions" სვეტში წაშლის ღილაკის დამატება**
        const deleteTd = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = "❌ წაშლა";
        deleteButton.style.backgroundColor = "red"; // ვიზუალური ეფექტისთვის
        deleteButton.style.color = "white";
        deleteButton.style.border = "none";
        deleteButton.style.padding = "5px";
        deleteButton.style.cursor = "pointer";

        deleteButton.onclick = function () {
            deleteWord(index); // ფუნქციის გამოძახება ინდექსით
        };

        deleteTd.appendChild(deleteButton);
        tr.appendChild(deleteTd);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
}

// **წაშლის ფუნქცია**
function deleteWord(index) {
    let storedData = localStorage.getItem('studyTableData');
    if (!storedData) return;

    let jsonData = JSON.parse(storedData);
    jsonData.splice(index, 1); // კონკრეტული ინდექსის ამოშლა

    localStorage.setItem('studyTableData', JSON.stringify(jsonData)); // განახლება
    loadTableData(); // ცხრილის განახლება
}

// **ცხრილის ჩატვირთვა ფანჯრის ჩატვირთვისას**
window.onload = loadTableData;


function exportData() {
    // Retrieve stored data
    const storedData = localStorage.getItem('studyTableData');
    if (!storedData) {
        alert("No data available for export.");
        return;
    }

    const jsonData = JSON.parse(storedData);

    if (!jsonData.length) {
        alert("No valid data found for export.");
        return;
    }

    // Check if the first row contains numeric keys and remove them
    const firstRowKeys = Object.keys(jsonData[0]);
    const numericKeys = firstRowKeys.every(key => !isNaN(key));

    let headers;
    let formattedData;

    if (numericKeys) {
        // If keys are numeric, use the second row as headers
        headers = Object.values(jsonData[0]); // Assume first row contains headers
        formattedData = jsonData.slice(1).map(row => Object.values(row));
    } else {
        // If keys are valid headers, use them directly
        headers = firstRowKeys;
        formattedData = jsonData.map(row => headers.map(header => row[header] !== undefined ? row[header] : ""));
    }

    // Ensure headers are the first row without numerical indexes
    const finalData = [headers, ...formattedData];

    // Convert JSON data to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Exported Data");

    // Create and trigger the download
    XLSX.writeFile(workbook, "exported_data.xlsx");
}




// Add export button to the UI
document.addEventListener("DOMContentLoaded", function () {
    const exportButton = document.createElement("button");
    exportButton.textContent = "Export";
    exportButton.id = "export-button";
    exportButton.style.position = "fixed";
    exportButton.style.bottom = "20px";
    exportButton.style.right = "20px";
    exportButton.style.zIndex = "9999"; // Ensure button is on top
    exportButton.style.padding = "10px 20px";
    exportButton.style.backgroundColor = "#007bff";
    exportButton.style.color = "white";
    exportButton.style.border = "none";
    exportButton.style.borderRadius = "5px";
    exportButton.style.cursor = "pointer";
    exportButton.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    exportButton.addEventListener("click", exportData);
    document.body.appendChild(exportButton);
});

document.addEventListener("DOMContentLoaded", function () {
    const table = document.querySelector("table tbody");

    function addDeleteButtons() {
        document.querySelectorAll("tbody tr").forEach(row => {
            if (!row.querySelector(".delete-btn")) { // თუ უკვე არის, თავიდან ნუ დაამატებ
                let actionCell = row.insertCell(-1);
                let deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.classList.add("delete-btn");
                deleteButton.addEventListener("click", function () {
                    row.remove();
                });
                actionCell.appendChild(deleteButton);
            }
        });
    }

    // ამატებს ახალ სიტყვას (დროებითი მონაცემები)
    function addWord(word, translation) {
        let row = table.insertRow();
        row.insertCell(0).textContent = word;
        row.insertCell(1).textContent = translation;
        let actionCell = row.insertCell(2);

        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-btn");
        deleteButton.addEventListener("click", function () {
            row.remove();
        });

        actionCell.appendChild(deleteButton);
    }

    // სატესტო მონაცემები
    addWord("Hello", "გამარჯობა");
    addWord("Goodbye", "ნახვამდის");

    addDeleteButtons();
});


function playText() {
    const playPauseButton = document.getElementById('play-pause');
    playPauseButton.innerHTML = '<i class="fas fa-stop"></i>';
    isPlaying = true;

    const tableRows = document.querySelectorAll('#study-table tbody tr');
    if (tableRows.length === 0) {
        alert('No data to read.');
        return;
    }

    function readRow() {
        if (!isPlaying || index >= tableRows.length) {
            stopText();
            return;
        }

        const currentRowIndex = wordOrder[index];
        highlightRow(tableRows, currentRowIndex);

        const row = tableRows[currentRowIndex];
        const cells = row.querySelectorAll('td');

        // Skip the quantity cell
        const word = cells[1].textContent;
        const translation = cells[2].textContent;
        const additionalTranslation = cells[3].textContent;
        const examples = cells[4].querySelectorAll('p');

        playNewWordAudio(() => {
            prepareDisplayQueue(word, translation, additionalTranslation, examples);
            displayNextItem();

            speakText(word, 'en-US', englishVoiceSelect.value, englishRateInput.value, () => {
                setTimeout(() => {
                    ensureTranslationAndExamples(translation, additionalTranslation, examples, () => {
                        if (!examplesCheckbox.checked) {
                            setTimeout(() => {
                                speakText(getRandomPhrase(), 'ka-GE', narratorVoiceSelect.value, georgianRateInput.value, () => {
                                    index++;
                                    if (index < tableRows.length) {
                                        readRow();
                                    } else {
                                        stopText();
                                    }
                                });
                            }, 50);
                        } else {
                            index++;
                            if (index < tableRows.length) {
                                readRow();
                            } else {
                                stopText();
                            }
                        }
                    });
                }, 50);
            });
        });
    }

    readRow();
}

function prepareDisplayQueue(word, translation, additionalTranslation, examples) {
    currentDisplayQueue = [];
    currentExampleIndex = 0;

    // Add word, translation, and additional translation
    const combinedText = additionalTranslation
        ? `${word} - ${translation} (${additionalTranslation})`
        : `${word} - ${translation}`;
    currentDisplayQueue.push({ type: 'word', content: combinedText });

    // Prepare examples
    let examplesList = [...examples];
    if (randomExamples) {
        shuffleArray(examplesList);
    }

    let count = examplesCount === 'all' ? examplesList.length : parseInt(examplesCount);
    examplesList = examplesList.slice(0, count);

    // Add selected examples to the queue
    examplesList.forEach(example => {
        const [englishExample, georgianExample] = splitExamplesByLanguage(example.textContent);
        currentDisplayQueue.push({ type: 'example', content: `${englishExample} — ${georgianExample}` });
    });
}


function displayNextItem() {
    if (!isPlaying || currentDisplayQueue.length === 0) {
        return;
    }

    const item = currentDisplayQueue.shift();
    updateWordDisplay(item);
}

function updateWordDisplay(item) {
    const wordDisplay = document.getElementById('word-display');
    const wordSection = document.querySelector('.word-section');
    const examplesSection = document.querySelector('.examples-section');
    const mainWordBlock = document.getElementById('main-word-block');

    // Clear previous content
    wordSection.innerHTML = '';
    examplesSection.innerHTML = '';

    if (item.type === 'word') {
        const [word, ...rest] = item.content.split(' - ');

        // Update and show the main word block
        document.getElementById('main-word').textContent = word;
        mainWordBlock.classList.add('visible');

        const wordElement = document.createElement('span');
        wordElement.textContent = rest.join(' - ');
        wordElement.className = 'combined-word';
        wordSection.appendChild(wordElement);
    } else if (item.type === 'example' && !examplesCheckbox.checked) {
        const [englishExample, georgianExample] = item.content.split(' — ');

        const exampleContainer = document.createElement('div');
        exampleContainer.className = 'example-container';

        const englishLine = document.createElement('p');
        englishLine.innerHTML = `<img src="us.svg" alt="US Flag" class="flag"> ${englishExample}`;
        englishLine.className = 'example english';

        const georgianLine = document.createElement('p');
        georgianLine.innerHTML = `<img src="ge.svg" alt="Georgian Flag" class="flag"> ${georgianExample}`;
        georgianLine.className = 'example georgian';

        exampleContainer.appendChild(englishLine);
        exampleContainer.appendChild(georgianLine);
        examplesSection.appendChild(exampleContainer);
    }

    // Trigger animation
    wordDisplay.classList.remove('animate');
    void wordDisplay.offsetWidth; // Trigger reflow
    wordDisplay.classList.add('animate');
}

function stopText() {
    const playPauseButton = document.getElementById('play-pause');
    playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    isPlaying = false;
    if (currentUtterance) {
        currentUtterance.onend = null; // Prevents the callback from being called
        synth.cancel();
    }
    removeHighlight();
    clearWordDisplay();
    currentDisplayQueue = []; // Clear the display queue
    currentExampleIndex = 0;

    // Hide the main word block
    document.getElementById('main-word-block').classList.remove('visible');
}

function clearWordDisplay() {
    const wordDisplay = document.getElementById('word-display');
    const wordSection = document.querySelector('.word-section');
    const examplesSection = document.querySelector('.examples-section');
    const mainWordBlock = document.getElementById('main-word-block');

    wordSection.innerHTML = '';
    examplesSection.innerHTML = '';
    document.getElementById('main-word').textContent = '';
    mainWordBlock.classList.remove('visible'); // Hide the main word block
    wordDisplay.classList.remove('animate');
}

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Assuming the first sheet is the one we want
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        saveData(jsonData);
        processData(jsonData);
    };

    reader.readAsArrayBuffer(file);
}

function saveData(data) {
    localStorage.setItem('studyTableData', JSON.stringify(data));
}

function loadStoredData() {
    const storedData = localStorage.getItem('studyTableData');
    if (storedData) {
        const jsonData = JSON.parse(storedData);
        processData(jsonData);
    }
}

function processData(data) {
    const tableBody = document.querySelector('#study-table tbody');
    tableBody.innerHTML = '';

    // Assuming the first row is the header
    const [header, ...rows] = data;

    rows.forEach((row, index) => {
        const word = row[2];
        const translation = row[4];
        const additionalTranslation = row[5] || '';
        const examples = row.slice(6).filter(cell => cell !== undefined).join(' ');

        if (word && translation && examples) {
            const rowElement = document.createElement('tr');

            // ახალი სვეტი რაოდენობისთვის
            const quantityCell = document.createElement('td');
            quantityCell.textContent = index + 1; // თითოეული სიტყვის რაოდენობა იქნება მისი ინდექსი პლუს ერთი
            quantityCell.setAttribute('data-label', 'Quantity');
            rowElement.appendChild(quantityCell);

            const wordCell = document.createElement('td');
            wordCell.textContent = word;
            wordCell.setAttribute('data-label', 'Word');
            rowElement.appendChild(wordCell);

            const translationCell = document.createElement('td');
            translationCell.textContent = translation;
            translationCell.setAttribute('data-label', 'Translation');
            rowElement.appendChild(translationCell);

            const additionalTranslationCell = document.createElement('td');
            additionalTranslationCell.textContent = additionalTranslation;
            additionalTranslationCell.setAttribute('data-label', 'Additional Translation');
            rowElement.appendChild(additionalTranslationCell);

            const examplesCell = document.createElement('td');
            examplesCell.innerHTML = formatExamples(examples);
            examplesCell.setAttribute('data-label', 'Examples');
            rowElement.appendChild(examplesCell);

            tableBody.appendChild(rowElement);
            wordOrder.push(index);
        }
    });

    if (shuffleMode) {
        shuffleWordOrder();
    }
}

function splitExamplesByLanguage(example) {
    const regex = /([ა-ჰ]+)/; // regex to identify Georgian characters
    const parts = example.split(' — ');
    if (parts.length === 2) {
        const georgianPart = regex.test(parts[0]) ? parts[0].trim() : parts[1].trim();
        const englishPart = regex.test(parts[0]) ? parts[1].trim() : parts[0].trim();
        return [englishPart, georgianPart];
    } else {
        const georgianPart = regex.test(example) ? example.trim() : '';
        const englishPart = !regex.test(example) ? example.trim() : '';
        return [englishPart, georgianPart];
    }
}

function formatExamples(examples) {
    const sentences = examples.split('\n');
    const formattedSentences = sentences.map(sentence => {
        const [englishPart, georgianPart] = splitExamplesByLanguage(sentence);
        return `<p>${englishPart} — ${georgianPart}</p>`;
    });
    return formattedSentences.join(' '); // Use a space instead of a newline
}


function shuffleWordOrder() {
    for (let i = wordOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordOrder[i], wordOrder[j]] = [wordOrder[j], wordOrder[i]];
    }
}

function clearData() {
    localStorage.removeItem('studyTableData');
    document.querySelector('#study-table tbody').innerHTML = '';
    wordOrder = [];
}

function togglePlayPause() {
    if (isPlaying) {
        stopText();
    } else {
        index = 0;
        playText();
    }
}

function ensureTranslationAndExamples(translation, additionalTranslation, examples, callback) {
    function speakWithPauses(text, lang, voice, rate, onComplete) {
        const parts = text.split(';').map(part => part.trim());
        let index = 0;

        function speakNext() {
            if (index < parts.length) {
                speakText(parts[index], lang, voice, rate, () => {
                    index++;
                    setTimeout(speakNext, 50); // 300ms pause between parts
                });
            } else {
                onComplete();
            }
        }

        speakNext();
    }

    if (translation) {
        speakWithPauses(translation, 'ka-GE', georgianVoiceSelect.value, georgianRateInput.value, () => {
            if (additionalTranslation) {
                speakWithPauses(additionalTranslation, 'ka-GE', georgianVoiceSelect.value, georgianRateInput.value, () => {
                    if (!examplesCheckbox.checked) {
                        announceExamples(() => readExamples(examples, 0, callback));
                    } else {
                        callback();
                    }
                });
            } else {
                if (!examplesCheckbox.checked) {
                    announceExamples(() => readExamples(examples, 0, callback));
                } else {
                    callback();
                }
            }
        });
    } else if (additionalTranslation) {
        speakWithPauses(additionalTranslation, 'ka-GE', georgianVoiceSelect.value, georgianRateInput.value, () => {
            if (!examplesCheckbox.checked) {
                announceExamples(() => readExamples(examples, 0, callback));
            } else {
                callback();
            }
        });
    } else {
        if (!examplesCheckbox.checked) {
            announceExamples(() => readExamples(examples, 0, callback));
        } else {
            callback();
        }
    }
}

function announceExamples(callback) {
    speakText("მაგალითები. ", 'ka-GE', narratorVoiceSelect.value, georgianRateInput.value, callback);
}

function readExamples(examples, index, callback) {
    if (!isPlaying || currentDisplayQueue.length === 0) {
        callback();
        return;
    }

    function readNextExample() {
        if (currentDisplayQueue.length === 0) {
            callback();
            return;
        }

        const item = currentDisplayQueue.shift();
        if (item.type === 'example') {
            const [englishExample, georgianExample] = item.content.split(' — ');

            // Display the next example
            updateWordDisplay(item);

            speakText(englishExample, 'en-US', englishVoiceSelect.value, englishRateInput.value, () => {
                setTimeout(() => {
                    speakText(georgianExample, 'ka-GE', georgianVoiceSelect.value, georgianRateInput.value, () => {
                        setTimeout(() => {
                            readNextExample();
                        }, 300);
                    });
                }, 300);
            });
        } else {
            readNextExample();
        }
    }

    readNextExample();
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function speakText(text, lang, voiceName, rate, callback) {
    if (!isPlaying) return;

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = lang;
    currentUtterance.voice = voices.find(voice => voice.name === voiceName);
    currentUtterance.rate = rate;
    currentUtterance.onend = callback;
    synth.speak(currentUtterance);
}
function openSettings() {
    document.getElementById('settings-modal').style.display = 'block';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}

function saveSettings() {
    const settings = {
        englishVoice: englishVoiceSelect.value,
        georgianVoice: georgianVoiceSelect.value,
        narratorVoice: narratorVoiceSelect.value,
        englishRate: englishRateInput.value,
        georgianRate: georgianRateInput.value,
        examplesEnabled: !examplesCheckbox.checked,
        shuffleEnabled: shuffleMode,
        darkModeEnabled: darkModeCheckbox.checked,
        playAudioBeforeNewWord: playAudioBeforeNewWordCheckbox.checked,
        selectedAudio: audioSelect.value,
        examplesCount: document.getElementById('examples-count').value,
        randomExamples: document.getElementById('random-examples').checked
    };
    localStorage.setItem('ttsSettings', JSON.stringify(settings));
    applyDarkMode(settings.darkModeEnabled);
    playAudioBeforeNewWord = settings.playAudioBeforeNewWord;
    selectedAudio = settings.selectedAudio;
    examplesCount = settings.examplesCount;
    randomExamples = settings.randomExamples;
    closeSettings();
}


function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('ttsSettings')) || {};

    englishVoiceSelect.value = settings.englishVoice || englishVoiceSelect.options[0].value;
    georgianVoiceSelect.value = settings.georgianVoice || georgianVoiceSelect.options[0].value;
    narratorVoiceSelect.value = settings.narratorVoice || narratorVoiceSelect.options[0].value;
    englishRateInput.value = settings.englishRate || '1';
    georgianRateInput.value = settings.georgianRate || '1';
    examplesCheckbox.checked = settings.examplesEnabled === undefined ? true : !settings.examplesEnabled;
    shuffleMode = settings.shuffleEnabled || false;
    darkModeCheckbox.checked = settings.darkModeEnabled || false;
    englishRateValue.textContent = settings.englishRate || '1';
    georgianRateValue.textContent = settings.georgianRate || '1';
    playAudioBeforeNewWordCheckbox.checked = settings.playAudioBeforeNewWord !== undefined ? settings.playAudioBeforeNewWord : true;
    audioSelect.value = settings.selectedAudio || 'audio1';
    document.getElementById('examples-count').value = settings.examplesCount || 'all';
    document.getElementById('random-examples').checked = settings.randomExamples || false;

    // Apply the loaded settings
    examplesCount = settings.examplesCount || 'all';
    randomExamples = settings.randomExamples || false;

    if (shuffleMode) {
        document.getElementById('shuffle').classList.add('active');
        shuffleWordOrder();
    }
    applyDarkMode(settings.darkModeEnabled);

    playAudioBeforeNewWord = playAudioBeforeNewWordCheckbox.checked;
    selectedAudio = audioSelect.value;
}

function applyDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

const englishRateInput = document.getElementById('english-rate');
const englishRateValue = document.getElementById('english-rate-value');
const georgianRateInput = document.getElementById('georgian-rate');
const georgianRateValue = document.getElementById('georgian-rate-value');
const englishVoiceSelect = document.getElementById('english-voice');
const georgianVoiceSelect = document.getElementById('georgian-voice');
const narratorVoiceSelect = document.getElementById('narrator-voice');
const examplesCheckbox = document.getElementById('examples-checkbox');
const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
const playAudioBeforeNewWordCheckbox = document.getElementById('play-audio-checkbox');
const audioSelect = document.getElementById('audio-select');

examplesCheckbox.addEventListener('change', function() {
    const settings = JSON.parse(localStorage.getItem('ttsSettings')) || {};
    settings.examplesEnabled = !this.checked;
    localStorage.setItem('ttsSettings', JSON.stringify(settings));
});

playAudioBeforeNewWordCheckbox.addEventListener('change', function() {
    playAudioBeforeNewWord = this.checked;
});

audioSelect.addEventListener('change', function() {
    selectedAudio = this.value;
});

examplesCheckbox.addEventListener('change', function() {
    const settings = JSON.parse(localStorage.getItem('ttsSettings')) || {};
    settings.examplesEnabled = !this.checked;
    localStorage.setItem('ttsSettings', JSON.stringify(settings));
});

const englishVoices = [
   "Microsoft AndrewMultilingual Online (Natural) - English (United States)",
   "Microsoft AvaMultilingual Online (Natural) - English (United States)",
   "Microsoft EmmaMultilingual Online (Natural) - English (United States)",
   "Microsoft BrianMultilingual Online (Natural) - English (United States)",
   "Microsoft Ava Online (Natural) - English (United States)",
   "Microsoft Libby Online (Natural) - English (United Kingdom)",
   "Microsoft Maisie Online (Natural) - English (United Kingdom)",
   "Microsoft Ryan Online (Natural) - English (United Kingdom)",
   "Microsoft Sonia Online (Natural) - English (United Kingdom)",
   "Microsoft Thomas Online (Natural) - English (United Kingdom)",
   "Microsoft Andrew Online (Natural) - English (United States)",
   "Microsoft Emma Online (Natural) - English (United States)",
   "Microsoft Brian Online (Natural) - English (United States)",
   "Microsoft Ana Online (Natural) - English (United States)",
   "Microsoft Aria Online (Natural) - English (United States)",
   "Microsoft Christopher Online (Natural) - English (United States)",
   "Microsoft Eric Online (Natural) - English (United States)",
   "Microsoft Guy Online (Natural) - English (United States)",
   "Microsoft Jenny Online (Natural) - English (United States)",
   "Microsoft Michelle Online (Natural) - English (United States)",
   "Microsoft Roger Online (Natural) - English (United States)",
   "Microsoft Steffan Online (Natural) - English (United States)",
];

const georgianVoices = [
    "Microsoft Eka Online (Natural) - Georgian (Georgia)",
    "Microsoft Giorgi Online (Natural) - Georgian (Georgia)",
    "Microsoft AndrewMultilingual Online (Natural) - English (United States)",
    "Microsoft AvaMultilingual Online (Natural) - English (United States)",
    "Microsoft EmmaMultilingual Online (Natural) - English (United States)",
    "Microsoft BrianMultilingual Online (Natural) - English (United States)",
];

const narratorVoices = [
    "Microsoft Eka Online (Natural) - Georgian (Georgia)",
    "Microsoft Giorgi Online (Natural) - Georgian (Georgia)",
    "Microsoft AndrewMultilingual Online (Natural) - English (United States)",
    "Microsoft AvaMultilingual Online (Natural) - English (United States)",
    "Microsoft EmmaMultilingual Online (Natural) - English (United States)",
    "Microsoft BrianMultilingual Online (Natural) - English (United States)",
];

const randomPhrases = [
    // "ახალი სიტყვა", "შემდეგი სიტყვა"
];

let shuffleMode = false;
let isPlaying = false;
let currentUtterance = null;
let index = 0;
let wordOrder = [];

function populateVoiceOptions(selectElement, voices) {
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice;
        option.textContent = voice;
        selectElement.appendChild(option);
    });
}

populateVoiceOptions(englishVoiceSelect, englishVoices);
populateVoiceOptions(georgianVoiceSelect, georgianVoices);
populateVoiceOptions(narratorVoiceSelect, narratorVoices);

englishRateInput.addEventListener('input', () => {
    englishRateValue.textContent = englishRateInput.value;
});

georgianRateInput.addEventListener('input', () => {
    georgianRateValue.textContent = georgianRateInput.value;
});

const synth = window.speechSynthesis;
let voices = [];

synth.onvoiceschanged = loadVoices;
loadVoices();

document.getElementById('file-input').addEventListener('change', handleFile, false);
document.addEventListener('DOMContentLoaded', () => {
    loadStoredData();
    loadSettings();
});
document.getElementById('play-pause').addEventListener('click', togglePlayPause);
document.getElementById('back').addEventListener('click', goBack);
document.getElementById('forward').addEventListener('click', goForward);
document.getElementById('shuffle').addEventListener('click', toggleShuffle);
document.getElementById('settings').addEventListener('click', openSettings);
document.querySelector('.close').addEventListener('click', closeSettings);
document.getElementById('save-settings').addEventListener('click', saveSettings);

function loadVoices() {
    voices = synth.getVoices();

    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    const kaVoices = voices.filter(v => v.lang.startsWith('ka'));

    if (enVoices.length > 0) englishVoiceSelect.value = enVoices[0].name;
    if (kaVoices.length > 0) georgianVoiceSelect.value = kaVoices[0].name;
}


function highlightRow(rows, index) {
    removeHighlight();
    const row = rows[index];
    if (document.body.classList.contains('dark-mode')) {
        row.classList.add('highlight-dark-mode');
    } else {
        row.classList.add('highlight-light-mode');
    }
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function removeHighlight() {
    const rows = document.querySelectorAll('#study-table tbody tr');
    rows.forEach(row => {
        row.classList.remove('highlight-light-mode');
        row.classList.remove('highlight-dark-mode');
    });
}

function goBack() {
    if (index > 0) {
        index--;
        if (isPlaying) {
            stopText();
            playText();
        } else {
            highlightRow(document.querySelectorAll('#study-table tbody tr'), wordOrder[index]);
        }
    }
}

function goForward() {
    const tableRows = document.querySelectorAll('#study-table tbody tr');
    if (index < tableRows.length - 1) {
        index++;
        if (isPlaying) {
            stopText();
            playText();
        } else {
            highlightRow(tableRows, wordOrder[index]);
        }
    }
}

function toggleShuffle() {
    shuffleMode = !shuffleMode;
    const shuffleButton = document.getElementById('shuffle');
    if (shuffleMode) {
        shuffleButton.classList.add('active');
        shuffleWordOrder();
    } else {
        shuffleButton.classList.remove('active');
        wordOrder.sort((a, b) => a - b);
    }

    saveSettings();
}

function getRandomPhrase() {
    return randomPhrases[Math.floor(Math.random() * randomPhrases.length)];
}