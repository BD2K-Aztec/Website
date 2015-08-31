db = db.getSiblingDB('BD2K');
db.dropDatabase();
db = db.getSiblingDB('BD2K');

db.createCollection("resource_stats");
db.createCollection("resource_search");

