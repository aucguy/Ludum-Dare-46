const developerMode = true;

const items = {
  bulletTravelTime: 3,
  bulletSpeed: 1000,
  bulletShootNum: 1,
  enemySpeed: 50,
  immuneTime: 3000,
  enemyDamage: 1,
  mapSize: 1000,
  buildingInitSpawn: 250,
  pickupInitSpawn: 50,
  ammoInitSpawnProp: 0.5,
  enemyInitSpawn: 100,
  marginFactor: 1,
  firstSpawnTime: 0,
  spawnTime: 50,
  enemySpawnChance: 0.33,
  ammoSpawnChance: 0.25,
  medsSpawnChance: 0.33,
  dropOffMedsDecr: 1,
  dropOffScoreIncr: 1,
  minMeds: 0,
  ammoHudX: 32,
  medsHudX: 160,
  healthHudX: 288,
  scoreHudX: 400,
  ammoPickupIncr: 3,
  medsPickupIncr: 1,
  initBullets: 10,
  initHealth: 3,
  initMeds: 0,
  playerSpeed: 125,
  healMedsDecr: 3,
  healHealthIncr: 1,
  maxSlimes: 7,
  maxPickups: 15,
  flashRate: 500
};

export function constants() {
  return items;
}

if(developerMode) {
  window.__constants = items;
}