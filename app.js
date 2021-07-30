const qwerty = document.getElementById('qwerty');
const btn_reset = document.querySelector('.btn__reset');
const phrase = document.getElementById('phrase');
const phrases = [
  'use your knowledge',
  'seize the day',
  'focus on goals',
  'show your work',
  'break the rules',
];
const message = document.querySelector('.message');
const overlay = document.getElementById('overlay');
const overlaySubtitle = document.getElementById('subtitle');
const maxMisses = 5;
let missed = 0;
let guessed = [];

// using objects here for easier state content management
const messageText = {
  hit: '✅ Letter found! ✅<br>Keep going.',
  miss: '❌ Letter not found! ❌<br>That letter is not in the current phrase. Try again.',
  duplicate: '😯 Doh! You already guessed that letter! 😯<br>Try again.',
  default:
    '✨✨✨ Welcome to the game! ✨✨✨<br>Pick a letter using your keyboard or mouse.',
};
const overlayStatus = {
  // [0: overlay display, 1: overlay class, 2: overlay btn text, 3: overlay message text]
  winner: ['flex', 'start winner', 'Reset Game', '🎉 You win! 🎉<br>Want to play again?',],
  loser: ['flex', 'start loser', 'Reset Game', '😭 You lose! 😭<br>Want to play again?'],
  default: ['none', 'start', 'Start Game', ''],
};

// update overlay
const updateOverlay = status => {
  overlay.style.display = overlayStatus[status][0];
  overlay.setAttribute('class', overlayStatus[status][1]);
  btn_reset.textContent = overlayStatus[status][2];
  overlaySubtitle.innerHTML = overlayStatus[status][3];
};

// update instructional text
const updateMessage = status => {
  message.innerHTML = messageText[status];
};


/*
 * RESET functions
 */

// get new random phrase and split it into an array of characters
const getRandomPhraseAsArray = arr => {
  return arr[Math.floor(Math.random() * phrases.length)].split('');
};

// loop through array of phrase characters and display as list items
const addPhraseToDisplay = arr => {
  // reset phrase in case replaying game
  phrase.innerHTML = '<ul></ul>';

  arr.forEach(letter => {
    let listItem = document.createElement('li');
    listItem.className = letter === ' ' ? 'space' : 'letter';
    listItem.textContent = letter;
    // using insertAdjacentHTML here because I think it's 
    // more performant than using appendChild
    phrase.querySelector('ul').insertAdjacentElement('beforeend', listItem);
  });

  // after phrase appended to the DOM, hide the overlay to show it
  updateOverlay('default');
};


/*
 * GAME PLAY functions
 */

// check if typed letter is in the current phrase and highlight it if so
const checkLetter = inputLetter => {
  const letters = phrase.querySelectorAll('.letter');
  let match = null;

  // if inputLetter matches any letters in the phrase,
  // update the instuctional message, 
  // highlight the letter in the phrase
  // return matched letter instead of null
  for (const letter of letters) {
    if (letter.textContent === inputLetter) {
      letter.classList.add('show');
      updateMessage('hit');
      match = inputLetter;
    }
  }

  return match;
};

// highlight the letter that was typed or clicked on the keyboard
const highlightButton = (inputLetter, letterFound) => {
  qwerty.querySelectorAll('.keyrow button:not([disabled])').forEach(btn => {
    if (btn.textContent === inputLetter.toLowerCase()) {
      btn.classList.add('show', letterFound ? 'found' : 'not-found');
      btn.disabled = true;
    }
  });
};

// if letter not found, increase missed count and show a lost heart
const missedLetter = () => {
  missed++;

  const liveHearts = document.querySelectorAll("[src$='liveHeart.png']");
  // make sure there's at least one live heart then make it a lost heart
  if (liveHearts.length >= 1) {
    liveHearts[0].setAttribute('src', 'images/lostHeart.png');
  }

  updateMessage('miss');
};

// check whether the game has been won or lost
const checkWin = () => {
  const showCount = phrase.querySelectorAll('.show').length;
  const lettersCount = phrase.querySelectorAll('.letter').length;

  if (lettersCount === showCount) {
    // all phrase letters are shown,
    updateOverlay('winner');
  } else if (missed >= maxMisses) {
    // max number of misses reached
    updateOverlay('loser');
  }
};

// process user input
const processInput = inputLetter => {
  // if inputLetter is already in the array of guessed letters, show message
  if (guessed.indexOf(inputLetter) > -1) {
    updateMessage('duplicate');
  } else {

    // add the new letter to the array of guessed letters
    guessed.push(inputLetter);

    // check if the letter is in the current phrase
    const letterFound = checkLetter(inputLetter);

    // if the letter is in the current phrase, highlight it
    highlightButton(inputLetter, letterFound);

    // if the letter is not in the current phrase, show a lost heart
    if (!letterFound) missedLetter();

    // check if the game has been won or lost
    checkWin();
  }
};


/*
 * EVENT LISTENERS
 */

// reset game
// resets missed, guessed, overlay, message, phrase, keyboard, hearts
btn_reset.addEventListener('click', () => {
  missed = 0;
  guessed = [];

  updateOverlay('default');
  updateMessage('default');
  addPhraseToDisplay(getRandomPhraseAsArray(phrases));

  qwerty.querySelectorAll('.keyrow button').forEach(btn => {
    btn.removeAttribute('class');
    btn.removeAttribute('disabled');
  });

  document.querySelectorAll("[src$='lostHeart.png']").forEach(img => {
    img.setAttribute('src', 'images/liveHeart.png');
  });
});

// mouse events
qwerty.addEventListener('click', (ev) => {
  const target = ev.target;

  // delegate event if the target is a button
  if (target.tagName === 'BUTTON') {
    const inputLetter = target.textContent;
    processInput(inputLetter);
  }
});

// keyboard events
window.addEventListener('keydown', ev => {
  let inputLetter = ev.key;

  // check if the key pressed was a letter key, then process it
  if (inputLetter.length === 1 || inputLetter.match(/[a-z]/i)) {
    processInput(inputLetter);
  }
  
});
