export const toPositiveFiniteNumber = (value) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

export const packRectangles = (baseArea, userPackages) => {
  const baseWidth = toPositiveFiniteNumber(baseArea?.width);
  const baseDepth = toPositiveFiniteNumber(baseArea?.depth);
  const baseHeight = toPositiveFiniteNumber(baseArea?.height) ?? 0;

  if (baseWidth === null || baseDepth === null) {
    return {
      packed: [],
      unpacked: [],
    };
  }

  const mainRect = {
    width: baseWidth,
    depth: baseDepth,
    height: baseHeight,
  };

  const rects = (Array.isArray(userPackages) ? userPackages : [])
    .map((rect) => {
      const width = toPositiveFiniteNumber(rect.width);
      const depth = toPositiveFiniteNumber(rect.depth);
      const height = toPositiveFiniteNumber(rect.height) ?? 20;

      if (width === null || depth === null) {
        return null;
      }

      return {
        id: rect.id,
        width,
        depth,
        height,
        area: width * depth,
      };
    })
    .filter(Boolean);

  return packWithFreeRectangles(mainRect, rects);
}

const rectanglesIntersect = (first, second) => !(
  second.x >= first.x + first.width ||
  second.x + second.width <= first.x ||
  second.y >= first.y + first.depth ||
  second.y + second.depth <= first.y
);

const rectangleContains = (outer, inner) => (
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.depth <= outer.y + outer.depth
);

const splitFreeSpace = (space, usedSpace) => {
  if (!rectanglesIntersect(space, usedSpace)) {
    return [space];
  }

  const splitSpaces = [];
  const spaceRight = space.x + space.width;
  const spaceBottom = space.y + space.depth;
  const usedRight = usedSpace.x + usedSpace.width;
  const usedBottom = usedSpace.y + usedSpace.depth;

  if (usedSpace.y > space.y) {
    splitSpaces.push({
      x: space.x,
      y: space.y,
      width: space.width,
      depth: usedSpace.y - space.y,
    });
  }

  if (usedBottom < spaceBottom) {
    splitSpaces.push({
      x: space.x,
      y: usedBottom,
      width: space.width,
      depth: spaceBottom - usedBottom,
    });
  }

  if (usedSpace.x > space.x) {
    splitSpaces.push({
      x: space.x,
      y: space.y,
      width: usedSpace.x - space.x,
      depth: space.depth,
    });
  }

  if (usedRight < spaceRight) {
    splitSpaces.push({
      x: usedRight,
      y: space.y,
      width: spaceRight - usedRight,
      depth: space.depth,
    });
  }

  return splitSpaces.filter((splitSpace) => (
    splitSpace.width > 0 && splitSpace.depth > 0
  ));
}

const pruneFreeSpaces = (spaces) => spaces.filter((space, index) => !spaces.some(
  (otherSpace, otherIndex) => (
    index !== otherIndex && rectangleContains(otherSpace, space)
  ),
));

const findBestPlacement = (rect, spaces) => {
  let bestFit = null;
  const orientations = [
    { width: rect.width, depth: rect.depth },
    { width: rect.depth, depth: rect.width },
  ];

  for (const space of spaces) {
    for (const orientation of orientations) {
      const { width, depth } = orientation;

      if (width > space.width || depth > space.depth) {
        continue;
      }

      const remainingArea = space.width * space.depth - width * depth;
      const shortSideResidual = Math.min(
        space.width - width,
        space.depth - depth,
      );
      const candidate = {
        ...rect,
        width,
        depth,
        x: space.x,
        y: space.y,
        remainingArea,
        shortSideResidual,
      };

      const isBetterFit =
        !bestFit ||
        candidate.remainingArea < bestFit.remainingArea ||
        (
          candidate.remainingArea === bestFit.remainingArea &&
          candidate.shortSideResidual < bestFit.shortSideResidual
        );

      if (isBetterFit) {
        bestFit = candidate;
      }
    }
  }

  return bestFit;
}

export const packWithFreeRectangles = (mainRect, rects) => {
  const packed = [];
  const unpacked = [];
  let spaces = [{
    x: 0,
    y: 0,
    width: mainRect.width,
    depth: mainRect.depth,
  }];
  const sortedRects = [...rects].sort((a, b) => b.area - a.area);

  for (const rect of sortedRects) {
    const bestFit = findBestPlacement(rect, spaces);

    if (!bestFit) {
      unpacked.push(rect);
      continue;
    }

    packed.push(bestFit);
    spaces = pruneFreeSpaces(
      spaces.flatMap((space) => splitFreeSpace(space, bestFit)),
    );
  }

  return { packed, unpacked };
}

// Kept for reference only. packRectangles now uses packWithFreeRectangles.

export const tryPackingCombinationLegacy = (mainRect, rects) => {
  const packed = [];
  const unpacked = [];
  const spaces = [
    {
      x: 0,
      y: 0,
      width: mainRect.width,
      depth: mainRect.depth,
    },
  ];

  const sortedRects = [...rects].sort((a, b) => b.area - a.area);

  for (const rect of sortedRects) {
    let bestFit = null;
    let bestSpace = null;

    const orientations = [
      { width: rect.width, depth: rect.depth },
      { width: rect.depth, depth: rect.width },
    ];

    for (const space of spaces) {
      for (const orientation of orientations) {
        const { width, depth } = orientation;

        if (width > space.width || depth > space.depth) {
          continue;
        }

        const remainingArea = space.width * space.depth - width * depth;
        const shortSideResidual = Math.min(
          space.width - width,
          space.depth - depth,
        );

        const candidate = {
          ...rect,
          width,
          depth,
          x: space.x,
          y: space.y,
          remainingArea,
          shortSideResidual,
        };

        const isBetterFit =
          !bestFit ||
          candidate.remainingArea < bestFit.remainingArea ||
          (
            candidate.remainingArea === bestFit.remainingArea &&
            candidate.shortSideResidual < bestFit.shortSideResidual
          );

        if (isBetterFit) {
          bestFit = candidate;
          bestSpace = space;
        }
      }
    }

    // If we can't pack a rectangle, continue with the others
    if (!bestFit) {
        unpacked.push(rect);
        continue;
    }

    packed.push(bestFit);

    const newSpaces = [];

    for (const space of spaces) {
      if (space !== bestSpace) {
        newSpaces.push(space);
        continue;
      }

      if (space.width - bestFit.width > 0) {
        newSpaces.push({
          x: space.x + bestFit.width,
          y: space.y,
          width: space.width - bestFit.width,
          depth: bestFit.depth,
        });
      }

      if (space.depth - bestFit.depth > 0) {
        newSpaces.push({
          x: space.x,
          y: space.y + bestFit.depth,
          width: space.width,
          depth: space.depth - bestFit.depth,
        });
      }
    }

    spaces.length = 0;
    spaces.push(...newSpaces);
  }

  return { packed, unpacked };
}
