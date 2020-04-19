const developerMode = true;

const items = {
  bulletTravelTime: 3,
  bulletSpeed: 1000,
  bulletShootNum: 1,
  enemySpeed: 30,
  immuneTime: 1000,
  enemyDamage: 1,
  mapSize: 1000,
  buildingInitSpawn: 250,
  pickupInitSpawn: 250,
  ammoInitSpawnProp: 0.5,
  enemyInitSpawn: 250,
  marginFactor: 1,
  firstSpawnTime: 10000,
  spawnTime: 5000,
  enemySpawnChance: 0.33,
  ammoSpawnChance: 0.33,
  medsSpawnChance: 0.33,
  dropOffMedsDecr: 1,
  dropOffScoreIncr: 1,
  minMeds: 0,
  ammoHudX: 32,
  medsHudX: 160,
  healthHudX: 288,
  scoreHudX: 400,
  ammoPickupIncr: 1,
  medsPickupIncr: 1,
  initBullets: 1000,
  initHealth: 1000,
  initMeds: 0,
  playerSpeed: 100,
  healMedsDecr: 1,
  healHealthIncr: 1
};

export function constants() {
  return items;
}

if(developerMode) {
  window.__constants = items;
}