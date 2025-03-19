import { marshall } from "@aws-sdk/util-dynamodb";
import { MovieReviews } from "./types";

//export const generateMovieReviewItem = (moviereview: MovieReviews) => {
  //return {
   // PutRequest: {
      //Item: marshall(moviereview),
   // },
 // };
//};

type Entity = MovieReviews;  // NEW
export const generateMovieReviewItem = (entity: Entity) => {
  return {
    PutRequest: {
      Item: marshall(entity),
   },
 };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => {
    return generateMovieReviewItem(e);
  });
};

