export const getColorForId = (id) => {
  const colors = [
    '#FF6B6B', // Bright red
    '#4ECDC4', // Light turquoise
    '#2D91D4', // Vibrant blue
    '#FFA07A', // Soft salmon
    '#A5D6A7', // Pastel green
    '#FFCC00', // Bright yellow
    '#9C27B0', // Deep purple
    '#FF8A80', // Bright pink
    '#3F51B5', // Dark blue
    '#DCE775', // Light lime green
  ];

  const hash = [...String(id)]
    .reduce((value, char) => value + char.charCodeAt(0), 0);

  return colors[hash % colors.length];
}

// Function to adjust color brightness
export const adjustColor = (color, amount) => {
  const clamp = (val) => Math.min(255, Math.max(0, val));

  // Convert hex to RGB
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);

  // Adjust brightness
  r = clamp(r + amount);
  g = clamp(g + amount);
  b = clamp(b + amount);

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}