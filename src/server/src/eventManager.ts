import "dotenv/config";
import process from "node:process";
import type { Db } from "mongodb";
import { MongoClient, ObjectId } from "mongodb";

export interface Event {
  id: string;
  start: number;
  end: number;
  title: string;
  desc: string;
  url: string;
  icon: string;
  type: string[];
  extra?: EventExtra;
}

export interface EventExtra {
  [key: string]: any;
}

const dbConfig = {
  mongo: process.env.DATABASE_URL!,
};

export class TouhouEventsManager {
  private dbReady: boolean = false;
  private dbClient: MongoClient;
  private db: Db;

  constructor(config: typeof dbConfig) {
    this.dbClient = new MongoClient(config.mongo);
    this.db = this.dbClient.db("touhouEvents");
  }

  public async createIndexes() {
    const indexExists = await this.db.collection("Events").indexExists("uniqueId");
    if (!indexExists) {
      await this.db.collection("Events").createIndex({ uniqueId: 1 }, { unique: true });
      console.log("Created index on Events.uniqueId");
    }
  }

  public static async getInstance(config: typeof dbConfig): Promise<TouhouEventsManager> {
    const instance = new TouhouEventsManager(config);
    await instance.connectDb();
    await instance.createIndexes();
    return instance;
  }

  private async connectDb() {
    await this.dbClient.connect();
    console.log("Connected to database");
    this.dbReady = true;
  }

  async createEvents(events: Event[]) {
    return await this.db.collection("Events").insertMany(events, {
      ordered: false,
      writeConcern: {
        w: 1,
      },
    });
  }

  // async searchEvents(query: string) {
  //   // transform albumId to ObjectId
  //   const eventsMatched = await this.db.collection("Events").aggregate([
  //     {
  //       $match: {
  //         $or: [
  //           {
  //             title: {
  //               $regex: query,
  //               $options: "i",
  //             },
  //           },
  //           {
  //             desc: {
  //               $regex: query,
  //               $options: "i",
  //             },
  //           },
  //         ],
  //       },
  //     },
  //     {
  //       $limit: 10,
  //     }
  //   ]).toArray();
  // }
}
export default await TouhouEventsManager.getInstance(dbConfig);
