export function generateStepPattern(numSteps) {
  const result = [];
  const values = [1, 2];
  let lastValue = null;

  while (numSteps > 0) {
    let value = null;

    if (lastValue === null || lastValue === 1 || numSteps === 2) {
      value = 2;
    } else if (numSteps === 1) {
      value = 1;
    } else {
      value = values[Math.floor(Math.random() * values.length)];
    }

    result.push(value);
    lastValue = value;
    numSteps -= value;
  }

  // concat 2 followed by a 1 to 3
  const pattern = [];

  for (let i = 0; i < result.length; i++) {
    const current = result[i];
    const next = result[i + 1];

    if (next && current === 2 && next === 1) {
      const value = current + next; // 3
      pattern.push(value);
      i += 1;
    } else {
      pattern.push(current);
    }
  }

  return pattern;
}

export function flattenPattern(pattern) {
  const flatPattern = [];

  for (let i = 0; i < pattern.length; i++) {
    const numBeats = pattern[i];

    for (let j = 0; j < numBeats; j++) {

      if (i === 0 && j === 0) {
        flatPattern.push(1);
      } else if (j === 0) {
        flatPattern.push(0.4);
      } else {
        flatPattern.push(0.1);
      }

    }
  }

  return flatPattern;
}

export const numStepsValues = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
