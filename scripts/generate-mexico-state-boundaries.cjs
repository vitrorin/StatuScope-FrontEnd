const fs = require('fs');
const path = require('path');
const polygonClipping = require('polygon-clipping');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'assets', 'maps', 'raw-states');
const outputPath = path.join(root, 'assets', 'maps', 'mexicoStateBoundaries.ts');

const states = [
  ['01-Ags.geojson', 'Aguascalientes'],
  ['02-Bc.geojson', 'Baja California'],
  ['03-Bcs.geojson', 'Baja California Sur'],
  ['04-Camp.geojson', 'Campeche'],
  ['05-Coah.geojson', 'Coahuila'],
  ['06-Col.geojson', 'Colima'],
  ['07-Chis.geojson', 'Chiapas'],
  ['08-Chih.geojson', 'Chihuahua'],
  ['09-Cdmx.geojson', 'Ciudad de Mexico'],
  ['10-Dgo.geojson', 'Durango'],
  ['11-Gto.geojson', 'Guanajuato'],
  ['12-Gro.geojson', 'Guerrero'],
  ['13-Hgo.geojson', 'Hidalgo'],
  ['14-Jal.geojson', 'Jalisco'],
  ['15-Mex.geojson', 'Mexico'],
  ['16-Mich.geojson', 'Michoacan'],
  ['17-Mor.geojson', 'Morelos'],
  ['18-Nay.geojson', 'Nayarit'],
  ['19-NL.geojson', 'Nuevo Leon'],
  ['20-Oax.geojson', 'Oaxaca'],
  ['21-Pue.geojson', 'Puebla'],
  ['22-Qro.geojson', 'Queretaro'],
  ['23-Qroo.geojson', 'Quintana Roo'],
  ['24-SLP.geojson', 'San Luis Potosi'],
  ['25-Sin.geojson', 'Sinaloa'],
  ['26-Son.geojson', 'Sonora'],
  ['27-Tab.geojson', 'Tabasco'],
  ['28-Tmps.geojson', 'Tamaulipas'],
  ['29-Tlax.geojson', 'Tlaxcala'],
  ['30-Ver.geojson', 'Veracruz'],
  ['31-Yuc.geojson', 'Yucatan'],
  ['32-Zac.geojson', 'Zacatecas'],
];

const tolerance = 0.025;
const preUnionTolerance = 0.002;
const detailToleranceByState = new Map([
  ['Ciudad de Mexico', 0.004],
  ['Aguascalientes', 0.01],
  ['Morelos', 0.01],
  ['Tlaxcala', 0.01],
]);

function asMultiPolygon(geometry) {
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function perpendicularDistance(point, start, end) {
  const [x, y] = point;
  const [x1, y1] = start;
  const [x2, y2] = end;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / Math.hypot(dx, dy);
}

function simplifyLine(points, epsilon) {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let index = 0;
  const lastIndex = points.length - 1;

  for (let i = 1; i < lastIndex; i += 1) {
    const distance = perpendicularDistance(points[i], points[0], points[lastIndex]);
    if (distance > maxDistance) {
      index = i;
      maxDistance = distance;
    }
  }

  if (maxDistance <= epsilon) return [points[0], points[lastIndex]];

  const left = simplifyLine(points.slice(0, index + 1), epsilon);
  const right = simplifyLine(points.slice(index), epsilon);
  return left.slice(0, -1).concat(right);
}

function simplifyRing(ring, epsilon = tolerance) {
  if (ring.length <= 4) return ring;
  const openRing = ring.slice(0, -1);
  const simplified = simplifyLine(openRing, epsilon);
  if (simplified.length < 3) return ring;
  const first = simplified[0];
  const last = simplified[simplified.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) simplified.push(first);
  return simplified.map(([lon, lat]) => [
    Number(lon.toFixed(5)),
    Number(lat.toFixed(5)),
  ]);
}

function finalToleranceForState(name) {
  return detailToleranceByState.get(name) ?? tolerance;
}

function simplifyMultiPolygon(multiPolygon, stateName) {
  const stateTolerance = finalToleranceForState(stateName);
  return multiPolygon
    .map((polygon) => [simplifyRing(polygon[0], stateTolerance)].filter((ring) => ring.length >= 4 && Math.abs(ringArea(ring)) > 0.002))
    .filter((polygon) => polygon.length > 0);
}

function simplifyMultiPolygonForUnion(multiPolygon) {
  return multiPolygon
    .map((polygon) => polygon.map((ring) => simplifyRing(ring, preUnionTolerance)).filter((ring) => ring.length >= 4))
    .filter((polygon) => polygon.length > 0);
}

function unionInBatches(multiPolygons) {
  const batchSize = 80;
  let merged = [];

  for (let index = 0; index < multiPolygons.length; index += batchSize) {
    const batch = multiPolygons.slice(index, index + batchSize);
    const batchUnion = polygonClipping.union(...batch);
    merged = merged.length === 0 ? batchUnion : polygonClipping.union(merged, batchUnion);
  }

  return merged;
}

function ringArea(ring) {
  let area = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

const features = states.map(([fileName, name]) => {
  const filePath = path.join(sourceDir, fileName);
  const input = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const multiPolygons = input.features
    .flatMap((feature) => asMultiPolygon(feature.geometry))
    .map((polygon) => [polygon])
    .flatMap((multiPolygon) => simplifyMultiPolygonForUnion(multiPolygon));
  const union = unionInBatches(multiPolygons);
  const coordinates = simplifyMultiPolygon(union, name);

  console.log(`${name}: ${input.features.length} features -> ${coordinates.length} polygon(s)`);

  return {
    id: fileName.slice(0, 2),
    name,
    geometry: {
      type: 'MultiPolygon',
      coordinates,
    },
  };
});

const content = `// Generated by scripts/generate-mexico-state-boundaries.cjs.
// Source: https://github.com/open-mexico/mexico-geojson (MIT).

export interface MexicoStateBoundary {
  id: string;
  name: string;
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
}

export const mexicoStateBoundaries: MexicoStateBoundary[] = ${JSON.stringify(features)};
`;

fs.writeFileSync(outputPath, content);
console.log(`Wrote ${path.relative(root, outputPath)}`);
